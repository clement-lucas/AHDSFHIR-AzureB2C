using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace HL_AHDSFHIR_BFFFunction
{
    public class Dummy
    {
        private readonly ILogger<Dummy> _logger;

        public Dummy(ILogger<Dummy> logger)
        {
            _logger = logger;
        }

        [Function("Dummy")]
        public IActionResult Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            return new OkObjectResult("Welcome to Azure Functions!");
        }
    }
}
