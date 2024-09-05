
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace HL_AHDSFHIR_AuthHandlerFunction
{
    public static class DeleteFHIRUserStub
    {
        [FunctionName("DeleteFHIRUserStub")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger logger, ExecutionContext context)
        {
            try
            {
                string invocationId = context.InvocationId.ToString();
                logger.LogInformation($"start DeleteFHIRUserStub request. Id={invocationId}");
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                JObject data = JObject.Parse(requestBody);
                var reqObjectId = data["objectId"]?.ToString();
                logger.LogInformation($"objectId={reqObjectId} Id={invocationId}");

                return new OkObjectResult(new
                {
                    objectId = reqObjectId,
                    status = "DeleteFHIRUserStub succeeded."
                });
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in DeleteFHIRUserStub: {ex.Message}");
                return new BadRequestObjectResult("Error in DeleteFHIRUserStub");
            }
            finally
            {
                logger.LogInformation($"End DeleteFHIRUserStub request. Id={context.InvocationId}");
            }
        }
    }
}
