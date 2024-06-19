using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Npgsql;

namespace HLAHDSFHIR.Function
{
    public class HLAHDSFHIRDBWrapper
    {
        private readonly Version _version1 = new(0, 0, 0, 2);
        private readonly ILogger<HLAHDSFHIRDBWrapper> _logger;

        public HLAHDSFHIRDBWrapper(ILogger<HLAHDSFHIRDBWrapper> logger)
        {
            _logger = logger;
        }

        [Function("GetAdditionalClaims")]
        public async Task<IActionResult> GetAdditionalClaims([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req, FunctionContext executionContext)
        {
            _logger.LogInformation("GetAdditionalClaims request.");

            // Read the request body  
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var data = JObject.Parse(requestBody);

            if (data == null)
            {
                return new BadRequestObjectResult("Invalid parameters.");
            }

            // Extract objectId from the request body  
            var objectId = data["objectId"]?.ToString();

            if (string.IsNullOrEmpty(objectId))
            {
                return new BadRequestObjectResult("objectId not found.");
            }

            var connectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING");
            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();
            using var command = new NpgsqlCommand(
                @"SELECT 
                    u.user_b2c_id, 
                    u.facility_code, 
                    u.patient_resource_id, 
                    f.fhir_service_url 
                FROM
                    users u
                JOIN 
                    facilities f 
                ON 
                    u.facility_code = f.facility_code 
                WHERE 
                    u.user_b2c_id = @objectId", conn);
            
            command.Parameters.AddWithValue("objectId", objectId);
            var reader = command.ExecuteReader();

            if (!reader.Read())
            {
                return new NotFoundObjectResult("Not found.");
            }

            var facilityCode = reader.GetString(1);
            var patientResourceId = reader.GetString(2);
            var fhirServiceUrl = reader.GetString(3);

            if (string.IsNullOrEmpty(facilityCode) || string.IsNullOrEmpty(patientResourceId) || string.IsNullOrEmpty(fhirServiceUrl))
            {
                return new NotFoundObjectResult("Not found.");
            }

            // Log the patient resource ID  
            _logger.LogInformation($"Facility Code: {facilityCode}");
            _logger.LogInformation($"Patient Resource ID: {patientResourceId}");
            _logger.LogInformation($"FHIR Service URL: {fhirServiceUrl}");

            // Construct the result  
            var result = new
            {
                version = "1.0.0",
                action = "Continue",
                //extension_facilityCode = facility, // custom claim  
                fhirUser = fhirServiceUrl + "/" + patientResourceId // custom claim  
            };

            return new OkObjectResult(result);
        }
    }
}