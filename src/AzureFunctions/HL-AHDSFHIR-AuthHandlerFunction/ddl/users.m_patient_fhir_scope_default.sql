CREATE SCHEMA IF NOT EXISTS users;
DROP TABLE IF EXISTS users.m_patient_fhir_scope_default CASCADE;

CREATE TABLE IF NOT EXISTS users.m_patient_fhir_scope_default
(
    scope_id int NOT NULL,
    delete_flag boolean NOT NULL DEFAULT false,
    update_datetime timestamp without time zone NOT NULL,
    CONSTRAINT m_patient_fhir_scope_default_pk PRIMARY KEY (scope_id)
);

COMMENT ON TABLE users.m_patient_fhir_scope_default IS 'デフォルト FHIR スコープ管理';
COMMENT ON COLUMN users.m_patient_fhir_scope_default.scope_id IS 'デフォルト FHIR スコープ ID';
COMMENT ON COLUMN users.m_patient_fhir_scope_default.delete_flag IS '削除フラグ';
COMMENT ON COLUMN users.m_patient_fhir_scope_default.update_datetime IS '更新日時';
