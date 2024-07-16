CREATE SCHEMA IF NOT EXISTS users;
DROP TABLE IF EXISTS users.m_patient_link_management CASCADE;

CREATE TABLE IF NOT EXISTS users.m_patient_link_management
(
    user_b2c_id character varying(64) COLLATE pg_catalog."default" NOT NULL,
    facility_code character(10) COLLATE pg_catalog."default" NOT NULL,
    patient_id character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    patient_resource_id character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    patient_name character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    role character varying(64) COLLATE pg_catalog."default" NOT NULL,
    link_start_date timestamp without time zone NOT NULL,
    delete_flag boolean NOT NULL DEFAULT false,
    update_datetime timestamp without time zone NOT NULL,
    CONSTRAINT m_patient_link_management_pk PRIMARY KEY (user_b2c_id, facility_code)
);

COMMENT ON TABLE users.m_patient_link_management IS '患者連携管理';
COMMENT ON COLUMN users.m_patient_link_management.user_b2c_id IS '患者アカウントID';
COMMENT ON COLUMN users.m_patient_link_management.facility_code IS '施設コード';
COMMENT ON COLUMN users.m_patient_link_management.patient_id IS '患者ID';
COMMENT ON COLUMN users.m_patient_link_management.patient_resource_id IS 'FHIR PatientリソースID';
COMMENT ON COLUMN users.m_patient_link_management.patient_name IS '患者名';
COMMENT ON COLUMN users.m_patient_link_management.role IS 'ロール';
COMMENT ON COLUMN users.m_patient_link_management.link_start_date IS 'リンクした日付';
COMMENT ON COLUMN users.m_patient_link_management.delete_flag IS '削除フラグ';
COMMENT ON COLUMN users.m_patient_link_management.update_datetime IS '更新日時';
