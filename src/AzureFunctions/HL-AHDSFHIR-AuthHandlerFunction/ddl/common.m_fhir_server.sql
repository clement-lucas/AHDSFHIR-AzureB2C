CREATE SCHEMA IF NOT EXISTS common;

DROP TABLE IF EXISTS common.m_fhir_server CASCADE;

CREATE TABLE common.m_fhir_server (
   facility_code char(10) NOT NULL
 , fhir_etl_version int NOT NULL
 , fhir_server_url varchar(2048) NOT NULL
 , CONSTRAINT m_fhir_server_pk PRIMARY KEY (facility_code,fhir_etl_version)
); 
COMMENT ON TABLE common.m_fhir_server IS 'FHIRサーバマスタ';
COMMENT ON COLUMN common.m_fhir_server.facility_code IS '施設コード';
COMMENT ON COLUMN common.m_fhir_server.fhir_etl_version IS 'FHIRサーバの通し番号';
COMMENT ON COLUMN common.m_fhir_server.fhir_server_url IS '(FHIR接続情報)FHIRサーバのurl';

