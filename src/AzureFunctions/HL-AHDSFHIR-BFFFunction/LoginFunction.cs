using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using System;

namespace HL_AHDSFHIR_BFFFunction
{
    public static class LoginFunction
    {
        [FunctionName("Login")]
        public static IActionResult Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequestMessage req,
            ILogger log)
        {
            // Retrieve values from environment variables  
            var b2cTenant = Environment.GetEnvironmentVariable("B2C_TENANT");
            var policyId = Environment.GetEnvironmentVariable("B2C_POLICY_ID");
            var clientId = Environment.GetEnvironmentVariable("CLIENT_ID");
            var redirectUri = Environment.GetEnvironmentVariable("REDIRECT_URI");

            // Generate the Azure AD B2C login URL  
            var loginUrl = $"https://{b2cTenant}.b2clogin.com/{b2cTenant}.onmicrosoft.com/oauth2/v2.0/authorize?p={policyId}&client_id={clientId}&nonce=defaultNonce&redirect_uri={redirectUri}&scope=openid&response_type=id_token";

            // Redirect the user to the login URL  
            return new RedirectResult(loginUrl);
        }
    }
}
