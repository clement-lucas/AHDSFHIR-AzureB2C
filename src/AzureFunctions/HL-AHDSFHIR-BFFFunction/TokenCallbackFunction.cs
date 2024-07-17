using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using System;

namespace HL_AHDSFHIR_BFFFunction
{
    public static class TokenCallbackFunction
    {
        public static class TokenCallbackFunction
        {
            private static HttpClient httpClient = new HttpClient();

            [FunctionName("TokenCallback")]
            public static async Task<IActionResult> Run(
                [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequestMessage req,
                ILogger log)
            {
                var formData = await req.Content.ReadAsFormDataAsync();
                var authCode = formData["code"];
                var redirectUri = formData["redirect_uri"];

                var tokenRequest = new HttpRequestMessage(HttpMethod.Post, Environment.GetEnvironmentVariable("TOKEN_URL"))
                {
                    Content = new FormUrlEncodedContent(new[]
                    {
                new KeyValuePair<string, string>("grant_type", "authorization_code"),
                new KeyValuePair<string, string>("code", authCode),
                new KeyValuePair<string, string>("client_id", Environment.GetEnvironmentVariable("CLIENT_ID")),
                new KeyValuePair<string, string>("redirect_uri", redirectUri),
                new KeyValuePair<string, string>("client_secret", Environment.GetEnvironmentVariable("CLIENT_SECRET"))
            })
                };
                tokenRequest.Content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

                var tokenResponse = await httpClient.SendAsync(tokenRequest);
                var tokenContent = await tokenResponse.Content.ReadAsStringAsync();

                var tokens = JObject.Parse(tokenContent);

                var sessionToken = Guid.NewGuid().ToString();
                await TokenStorageHelper.StoreTokensAsync(sessionToken, tokens);

                return new OkObjectResult(new { sessionToken = sessionToken });
            }
        }
    }
}