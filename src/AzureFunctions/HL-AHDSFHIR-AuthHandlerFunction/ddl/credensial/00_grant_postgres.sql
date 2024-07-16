-- これは postgres データベースで実行してください。
-- 以下は、 SQL Server の認証に AAD を使用する場合、このクエリを実行してください。
-- <web-app-name> の部分を、Web アプリケーションの名前に置き換えてください。
-- 定数として使用するアプリケーション名を設定
DO $$
DECLARE
  app_name CONSTANT VARCHAR := '<web-app-name>';
BEGIN
  EXECUTE 'SELECT * FROM pgaadauth_create_principal(' || quote_literal(app_name) || ', false, false);';
END $$;