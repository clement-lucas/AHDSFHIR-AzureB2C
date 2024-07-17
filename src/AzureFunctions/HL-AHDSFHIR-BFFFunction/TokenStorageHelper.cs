using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace HL_AHDSFHIR_BFFFunction
{
    public class TokenEntity : TableEntity
    {
        public string Tokens { get; set; }
    }

    public static class TokenStorageHelper
    {
        private static string StorageConnectionString = Environment.GetEnvironmentVariable("STORAGE_CONNECTION_STRING");

        public static async Task StoreTokensAsync(string sessionToken, JObject tokens)
        {
            var storageAccount = CloudStorageAccount.Parse(StorageConnectionString);
            var tableClient = storageAccount.CreateCloudTableClient();
            var table = tableClient.GetTableReference("TokensTable");

            await table.CreateIfNotExistsAsync();

            var tokenEntity = new TokenEntity
            {
                PartitionKey = "Tokens",
                RowKey = sessionToken,
                Tokens = tokens.ToString()
            };

            var insertOperation = TableOperation.InsertOrReplace(tokenEntity);
            await table.ExecuteAsync(insertOperation);
        }

        public static async Task<JObject> RetrieveTokensAsync(string sessionToken)
        {
            var storageAccount = CloudStorageAccount.Parse(StorageConnectionString);
            var tableClient = storageAccount.CreateCloudTableClient();
            var table = tableClient.GetTableReference("TokensTable");

            var retrieveOperation = TableOperation.Retrieve<TokenEntity>("Tokens", sessionToken);
            var result = await table.ExecuteAsync(retrieveOperation);
            var tokenEntity = result.Result as TokenEntity;

            if (tokenEntity == null)
            {
                return null;
            }

            return JObject.Parse(tokenEntity.Tokens);
        }
    }
}