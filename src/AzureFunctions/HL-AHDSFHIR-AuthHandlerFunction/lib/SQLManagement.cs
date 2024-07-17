using System;
using Azure.Identity;
using Microsoft.Extensions.Logging;

namespace HL_AHDSFHIR_AuthHandlerFunction.lib
{
    public static class SQLManagement
    {
        public static int GetRetryInterval(ILogger logger, string invocationId)
        {
            var retryInterval = Environment.GetEnvironmentVariable("SQL_RETRY_INTERVAL");
            if (String.IsNullOrEmpty(retryInterval))
            {
                logger.LogError($"SQL_RETRY_INTERVAL is not set. Id={invocationId}");
                throw new Exception("SQL_RETRY_INTERVAL is not set.");
            }
            return int.Parse(retryInterval);
        }

        public static int GetRetryCount(ILogger logger, string invocationId)
        {
            var retryCount = Environment.GetEnvironmentVariable("SQL_RETRY_COUNT");
            if (String.IsNullOrEmpty(retryCount))
            {
                logger.LogError($"SQL_RETRY_COUNT is not set. Id={invocationId}");
                throw new Exception("SQL_RETRY_COUNT is not set.");
            }
            return int.Parse(retryCount);
        }

        public static string GetConnectionString(ILogger logger, string invocationId)
        {
            string host = Environment.GetEnvironmentVariable("SQL_HOST_NAME");
            if (String.IsNullOrEmpty(host))
            {
                logger.LogError($"SQL_HOST_NAME is not set. Id={invocationId}");
                throw new Exception("SQL_HOST_NAME is not set.");
            }
            string user = Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME");
            if (String.IsNullOrEmpty(user))
            {
                logger.LogError($"WEBSITE_SITE_NAME is not set. Id={invocationId}");
                throw new Exception("WEBSITE_SITE_NAME is not set.");
            }
            string dataBase = Environment.GetEnvironmentVariable("SQL_DATABASE_NAME");
            if (String.IsNullOrEmpty(dataBase))
            {
                logger.LogError($"SQL_DATABASE_NAME is not set. Id={invocationId}");
                throw new Exception("SQL_DATABASE_NAME is not set.");
            }
            string portStr = Environment.GetEnvironmentVariable("SQL_PORT");
            if (String.IsNullOrEmpty(portStr))
            {
                logger.LogError($"SQL_PORT is not set. Id={invocationId}");
                throw new Exception("SQL_PORT is not set.");
            }
            int port = int.Parse(portStr);
            string sslmode = Environment.GetEnvironmentVariable("SQL_SSL_MODE");
            if (String.IsNullOrEmpty(sslmode))
            {
                logger.LogError($"SQL_SSL_MODE is not set. Id={invocationId}");
                throw new Exception("SQL_SSL_MODE is not set.");
            }

            // Call managed identities for Azure resources endpoint.
            var sqlServerTokenProvider = new DefaultAzureCredential();
            string accessToken = sqlServerTokenProvider.GetToken(
                    new Azure.Core.TokenRequestContext(scopes: ["https://ossrdbms-aad.database.windows.net/.default"]) { }).Token;

            string connString =
                String.Format(
                    "Server={0}; User Id={1}; Database={2}; Port={3}; Password={4}; SSLMode={5}",
                    host,
                    user,
                    dataBase,
                    port,
                    accessToken,
                    sslmode);

            return connString;
        }
    }
}
