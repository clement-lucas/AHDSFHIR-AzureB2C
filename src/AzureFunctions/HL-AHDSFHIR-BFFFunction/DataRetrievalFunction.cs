using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace HL_AHDSFHIR_BFFFunction
{
    public static class DataRetrievalFunction
    {
        private static HttpClient httpClient = new HttpClient();

        [FunctionName("DataRetrieval")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequestMessage req,
            ILogger log)
        {
            if (!req.Headers.TryGetValues("session-token", out var sessionTokenValues))
            {
                return new UnauthorizedResult();
            }
            var sessionToken = sessionTokenValues.FirstOrDefault();

            var tokens = await TokenStorageHelper.RetrieveTokensAsync(sessionToken);
            if (tokens == null)
            {
                return new UnauthorizedResult();
            }

            var accessToken = tokens["access_token"].ToString();
            var facilityCode = req.RequestUri.ParseQueryString()["facilityCode"];
            var fhirServiceUrl = $"https://example.fhir.service/{facilityCode}";

            var fhirRequest = new HttpRequestMessage(HttpMethod.Get, fhirServiceUrl);
            fhirRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.SendAsync(fhirRequest);
            if (!response.IsSuccessStatusCode)
            {
                return new StatusCodeResult((int)response.StatusCode);
            }

            var data = await response.Content.ReadAsStringAsync();
            var jsonData = JObject.Parse(data);

            return new OkObjectResult(jsonData);
        }
    }
}