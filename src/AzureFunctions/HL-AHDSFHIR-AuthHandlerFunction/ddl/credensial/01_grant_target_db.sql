-- これは、対象業務 データベースで実行してください。
-- 以下は、 SQL Server の認証に AAD を使用する場合、このクエリを実行してください。
-- <web-app-name> の部分を、Web アプリケーションの名前に置き換えてください。
-- 定数として使用するアプリケーション名を設定
DO $$
DECLARE
  app_name CONSTANT VARCHAR := '<web-app-name>';
BEGIN
  EXECUTE 'GRANT usage ON SCHEMA common TO ' || quote_ident(app_name) || ';';
  EXECUTE 'GRANT SELECT ON common.m_fhir_server TO ' || quote_ident(app_name) || ';';
  EXECUTE 'GRANT usage ON SCHEMA users TO ' || quote_ident(app_name) || ';';
  EXECUTE 'GRANT SELECT ON users.m_patient_link_management TO ' || quote_ident(app_name) || ';';
END $$;