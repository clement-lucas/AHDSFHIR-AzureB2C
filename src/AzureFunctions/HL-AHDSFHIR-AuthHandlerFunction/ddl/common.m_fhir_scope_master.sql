CREATE SCHEMA IF NOT EXISTS common;

DROP TABLE IF EXISTS common.m_fhir_scope_master CASCADE;

CREATE TABLE common.m_fhir_scope_master (
   scope_id int NOT NULL,
   scope_value character varying(2048) COLLATE pg_catalog."default" NOT NULL,
   CONSTRAINT m_fhir_scope_master_pk PRIMARY KEY (scope_id)
); 
COMMENT ON TABLE common.m_fhir_scope_master IS 'FHIR スコープマスター';
COMMENT ON COLUMN common.m_fhir_scope_master.scope_id IS 'FHIR スコープ ID';
COMMENT ON COLUMN common.m_fhir_scope_master.scope_value IS 'FHIR スコープ 値';

