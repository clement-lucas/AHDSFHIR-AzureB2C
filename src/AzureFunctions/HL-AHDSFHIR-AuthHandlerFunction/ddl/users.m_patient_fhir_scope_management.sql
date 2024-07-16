CREATE SCHEMA IF NOT EXISTS users;
DROP TABLE IF EXISTS users.m_patient_fhir_scope_management CASCADE;

CREATE TABLE IF NOT EXISTS users.m_patient_fhir_scope_management
(
    user_b2c_id character varying(64) COLLATE pg_catalog."default" NOT NULL,
    scope_id int NOT NULL,
    delete_flag boolean NOT NULL DEFAULT false,
    update_datetime timestamp without time zone NOT NULL,
    CONSTRAINT m_patient_fhir_scope_management_pk PRIMARY KEY (user_b2c_id, scope_id)
);

COMMENT ON TABLE users.m_patient_fhir_scope_management IS '患者 FHIR スコープ管理';
COMMENT ON COLUMN users.m_patient_fhir_scope_management.user_b2c_id IS '患者アカウントID';
COMMENT ON COLUMN users.m_patient_fhir_scope_management.scope_id IS 'FHIR スコープ ID';
COMMENT ON COLUMN users.m_patient_fhir_scope_management.delete_flag IS '削除フラグ';
COMMENT ON COLUMN users.m_patient_fhir_scope_management.update_datetime IS '更新日時';
