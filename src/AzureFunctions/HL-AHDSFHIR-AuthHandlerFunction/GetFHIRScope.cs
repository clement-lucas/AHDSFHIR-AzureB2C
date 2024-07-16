
using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Npgsql;
using HL_AHDSFHIR_AuthHandlerFunction.lib;

namespace HL_AHDSFHIR_AuthHandlerFunction
{
    public static class GetFHIRScope
    {
        [FunctionName("GetFHIRScope")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger logger, ExecutionContext context)
        {
            string invocationId = context.InvocationId.ToString();
            logger.LogInformation($"start GetFHIRUser request. Id={invocationId}");
            try{
                // Read the request body  
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                // Log the request body data  
                logger.LogInformation($"Request Body: {requestBody}, Id={invocationId}");
                // Parse the request body as a JSON object  
                JObject data = JObject.Parse(requestBody);
                // Extract objectId from the request body  
                var reqObjectId = data["objectId"]?.ToString();
                if (data == null || string.IsNullOrEmpty(reqObjectId) )
                {
                    var dummyResult = new
                    {
                        scopes = ""
                    };
                    logger.LogInformation($"Returning dummy result: {dummyResult}, Id={invocationId}");
                    return new OkObjectResult(dummyResult);
                }

                var funcGetScopeByUser = new Func<NpgsqlConnection, NpgsqlCommand>(conn => {
                    var command = new NpgsqlCommand(
                        @"SELECT 
                            m.scope_value
                        FROM
                            users.m_patient_fhir_scope_management u
                        JOIN 
                            common.m_fhir_scope_master m 
                        ON 
                            u.scope_id = m.scope_id 
                        WHERE 
                            u.user_b2c_id = @objectId
                            AND u.delete_flag = false;", conn);
                    command.Parameters.AddWithValue("objectId", reqObjectId);
                    return command;
                });

                var scopeValueList = GetScopeValueList(logger, funcGetScopeByUser, invocationId);
                if (scopeValueList == null)
                {
                    return new BadRequestObjectResult("Internal Server Error.");
                }

                if (scopeValueList.Count >= 0)
                {
                    foreach (var scopeValue in scopeValueList)
                    {
                        logger.LogInformation($"reqObjectId: {reqObjectId}, Scope Value: {scopeValue}, Id={invocationId}");
                    }

                    // Construct the result  
                    var result = new
                    {
                        scopes = scopeValueList
                    };
                    logger.LogInformation($"Response Body: {result}, Id={invocationId}");
                    return new OkObjectResult(result);
                }

                // not found.
                var funcGetScopeDefault = new Func<NpgsqlConnection, NpgsqlCommand>(conn => {
                    var command = new NpgsqlCommand(
                        @"SELECT 
                            m.scope_value
                        FROM
                            users.m_patient_fhir_scope_default d
                        JOIN 
                            common.m_fhir_scope_master m 
                        ON 
                            d.scope_id = m.scope_id 
                        WHERE 
                            AND d.delete_flag = false;", conn);
                    return command;
                });

                scopeValueList = GetScopeValueList(logger, funcGetScopeDefault, invocationId);
                if (scopeValueList == null)
                {
                    return new BadRequestObjectResult("Internal Server Error.");
                }

                foreach (var scopeValue in scopeValueList)
                {
                    logger.LogInformation($"reqObjectId: {reqObjectId}, Scope Value: {scopeValue}, Id={invocationId}");
                }

                // Construct the result  
                var resultDefault = new
                {
                    scopes = scopeValueList 
                };
                logger.LogInformation($"Response Body: {resultDefault}, Id={invocationId}");
                return new OkObjectResult(resultDefault);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while processing the request. error: {ex.Message}, Id={invocationId}");
                return new BadRequestObjectResult("Error occurred while processing the request.");
            }
            finally
            {
                logger.LogInformation($"end GetFHIRUser request. Id={invocationId}");
            }
        }

        private static List<string> GetScopeValueList(
            ILogger logger, 
            Func<NpgsqlConnection, NpgsqlCommand> func, 
            string invocationId)
        {
            var connectionString = SQLManagement.GetConnectionString(logger, invocationId);
            var retryInterval = SQLManagement.GetRetryInterval(logger, invocationId);
            var retryCount = SQLManagement.GetRetryCount(logger, invocationId);
            logger.LogInformation($"retryInterval: {retryInterval}");
            logger.LogInformation($"retryCount: {retryCount}");

            // Retry connecting to DB and reading it
            while(true)
            {
                logger.LogInformation($"Connecting to DB and reading it. interval: {retryInterval}, retry count: {retryCount}, Id={invocationId}");
                try
                {
                    var tennantId = Environment.GetEnvironmentVariable("FHIR_TENANT_ID");
                    var applicationId = Environment.GetEnvironmentVariable("FHIR_APPLICATION_ID");
                    if (String.IsNullOrEmpty(tennantId)
                    || String.IsNullOrEmpty(applicationId))
                    {
                        logger.LogError("FHIR_TENANT_ID or FHIR_APPLICATION_ID is not set.");
                        return null;
                    }

                    using var conn = new NpgsqlConnection(connectionString);
                    conn.Open();
                    using var command = func(conn);
                    var scopeValueList = new List<string>();
                    using (var reader = command.ExecuteReader())
                    {
                        // レコードをリストに格納
                        while (reader.Read())
                        {
                            var scope_value = $"{tennantId}/{applicationId}/{reader.GetString(0)}"; 
                            scopeValueList.Add(scope_value);
                        }
                    }
                    if (scopeValueList.Count == 0)
                    {
                        return scopeValueList;
                    }
                    return scopeValueList;
                }
                catch (Exception ex)
                {
                    if (retryCount > 0)
                    {
                        retryCount--;
                        Task.Delay(retryInterval);
                        logger.LogInformation(ex, 
                            $"Retry connecting to DB and reading it. interval: {retryInterval}, retry count: {retryCount}, error: {ex.Message}, Id={invocationId}"); 
                        continue;
                    }
                    else
                    {
                        logger.LogError(ex, 
                            $"Error occurred while connecting to DB and reading it. error: {ex.Message}, Id={invocationId}");
                        return null;
                    }
                }
            }
        }
    }
}
