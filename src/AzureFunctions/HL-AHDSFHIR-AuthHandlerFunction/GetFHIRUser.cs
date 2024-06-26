
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Npgsql;
namespace HL_AHDSFHIR_AuthHandlerFunction
{
    public static class GetFHIRUser
    {
        [FunctionName("GetFHIRUser")]
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
                var reqFacilityCode = data["facilityCode"]?.ToString();
                var trigerringClient = data["trigerringClient"]?.ToString();
                logger.LogInformation($"Web API call trigerred from: {trigerringClient}, Id={invocationId}");
                if (data == null || string.IsNullOrEmpty(reqObjectId) || string.IsNullOrEmpty(reqFacilityCode))
                {
                    var dummyResult = new
                    {
                        facilityCode = "",
                        fhirUser = ""
                    };
                    logger.LogInformation($"Returning dummy result: {dummyResult}, Id={invocationId}");
                    return new OkObjectResult(dummyResult);
                }
                var connectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING");
                var retryInterval = int.Parse(Environment.GetEnvironmentVariable("SQL_RETRY_INTERVAL"));
                var retryCount = int.Parse(Environment.GetEnvironmentVariable("SQL_RETRY_COUNT"));
                logger.LogInformation($"retryInterval: {retryInterval}");
                logger.LogInformation($"retryCount: {retryCount}");
                var resFacilityCode = "";
                var resPatientResourceId = "";
                var resFHIRServiceUrl = "";

                // Retry connecting to DB and reading it
                while(true)
                {
                    logger.LogInformation($"Connecting to DB and reading it. interval: {retryInterval}, retry count: {retryCount}, Id={invocationId}");
                    try
                    {
                        using var conn = new NpgsqlConnection(connectionString);
                        conn.Open();
                        using var command = new NpgsqlCommand(
                            @"SELECT 
                                u.facility_code, 
                                u.patient_resource_id, 
                                f.fhir_server_url
                            FROM
                                users.m_patient_link_management u
                            JOIN 
                                common.m_fhir_server f 
                            ON 
                                u.facility_code = f.facility_code 
                            WHERE 
                                u.user_b2c_id = @objectId AND u.facility_code = @facilityCode 
                                AND u.delete_flag = false", conn);
                        command.Parameters.AddWithValue("objectId", reqObjectId);
                        command.Parameters.AddWithValue("facilityCode", reqFacilityCode);
                        var reader = command.ExecuteReader();
                        if (!reader.Read())
                        {
                            return new NotFoundObjectResult("Not found.");
                        }
                        resFacilityCode = reader.GetString(0);
                        resPatientResourceId = reader.GetString(1);
                        resFHIRServiceUrl = reader.GetString(2);
                    }
                    catch (Exception ex)
                    {
                        if (retryCount > 0)
                        {
                            retryCount--;
                            await Task.Delay(retryInterval);
                            logger.LogInformation(ex, 
                                $"Retry connecting to DB and reading it. interval: {retryInterval}, retry count: {retryCount}, error: {ex.Message}, Id={invocationId}"); 
                            continue;
                        }
                        else
                        {
                            logger.LogError(ex, 
                                $"Error occurred while connecting to DB and reading it. error: {ex.Message}, Id={invocationId}");
                            return new BadRequestObjectResult("Internal Server Error.");
                        }
                    }
                    break;
                }
                if (string.IsNullOrEmpty(resFacilityCode) || string.IsNullOrEmpty(resPatientResourceId) || string.IsNullOrEmpty(resFHIRServiceUrl))
                {
                    return new NotFoundObjectResult("Not found.");
                }
                // Trim resFacilityCode
                resFacilityCode = resFacilityCode.Trim();

                // Log the patient resource ID  
                logger.LogInformation($"Facility Code: {resFacilityCode}, Id={invocationId}");
                logger.LogInformation($"Patient Resource ID: {resPatientResourceId}, Id={invocationId}");
                logger.LogInformation($"FHIR Service URL: {resFHIRServiceUrl}, Id={invocationId}");
                // Construct the result  
                var result = new
                {
                    //version = "1.0.0",
                    //action = "Continue",
                    facilityCode = resFacilityCode, // custom claim  
                    fhirUser = resFHIRServiceUrl + "/" + resPatientResourceId // custom claim  
                };
                logger.LogInformation($"Response Body: {result}, Id={invocationId}");
                return new OkObjectResult(result);
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
    }
}
