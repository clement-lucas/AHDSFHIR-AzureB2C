using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Npgsql;

namespace HL_AHDSFHIR_AuthHandlerFunction
{
    public static class GetFHIRUser
    {
        [FunctionName("GetFHIRUser")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger logger)
        {
            logger.LogInformation("GetFHIRUser request.");

            // Read the request body  
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var data = JObject.Parse(requestBody);

            if (data == null)
            {
                return new BadRequestObjectResult("Invalid parameters.");
            }

            // Extract objectId from the request body  
            var reqObjectId = data["sub"]?.ToString();
            var reqFacilityCode = data["facilityCode"]?.ToString();

            if (string.IsNullOrEmpty(reqObjectId) || string.IsNullOrEmpty(reqFacilityCode))
            {
                return new BadRequestObjectResult("Missing required parameters.");
            }

            var connectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING");
            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();
            using var command = new NpgsqlCommand(
                @"SELECT 
                    u.user_b2c_id, 
                    u.facility_code, 
                    u.patient_resource_id, 
                    f.fhir_service_url,
                    f.facility_name
                FROM
                    users u
                JOIN 
                    facilities f 
                ON 
                    u.facility_code = f.facility_code 
                WHERE 
                    u.user_b2c_id = @objectId AND u.facility_code = @facilityCode", conn);

            command.Parameters.AddWithValue("objectId", reqObjectId);
            command.Parameters.AddWithValue("facilityCode", reqFacilityCode);
            var reader = command.ExecuteReader();

            if (!reader.Read())
            {
                return new NotFoundObjectResult("Not found.");
            }

            var resFacilityCode = reader.GetString(1);
            var resPatientResourceId = reader.GetString(2);
            var resFHIRServiceUrl = reader.GetString(3);

            if (string.IsNullOrEmpty(resFacilityCode) || string.IsNullOrEmpty(resPatientResourceId) || string.IsNullOrEmpty(resFHIRServiceUrl))
            {
                return new NotFoundObjectResult("Not found.");
            }

            // Log the patient resource ID  
            logger.LogInformation($"Facility Code: {resFacilityCode}");
            logger.LogInformation($"Patient Resource ID: {resPatientResourceId}");
            logger.LogInformation($"FHIR Service URL: {resFHIRServiceUrl}");

            // Construct the result  
            var result = new
            {
                version = "1.0.0",
                action = "Continue",
                facilityCode = resFacilityCode, // custom claim  
                fhirUser = resFHIRServiceUrl + "/" + resPatientResourceId // custom claim  
            };

            return new OkObjectResult(result);
        }
    }
}
