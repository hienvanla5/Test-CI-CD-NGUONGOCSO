-- ============================================================
-- NGUỒN GỐC SỐ - Database initialization
-- Runs ONLY on the first start of an empty MySQL data volume.
-- Loads the application's schema + seed data from the project's
-- migration SQL files (V1..V20) in correct dependency order.
-- Flyway is disabled in the app, so these files are the canonical
-- source of the schema and seed data (see AGENTS.md).
-- ============================================================

SOURCE /docker-entrypoint-initdb.d/migrations/V1__create_auth_tables.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V2__seed_roles.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V3__seed_permissions.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V4__seed_admin_data.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V5__seed_product_categories.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V7__create_code_ranges_table.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V8__create_chain_events_table.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V9__create_product_feedbacks_table.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V10__create_report_access_log.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V11__create_dossier_export_history.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V12__create_trace_code_scan_logs.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V13__create_failed_event_logs.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V14__create_activity_logs_table.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V15__create_certification_and_offline_sync_tables.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V16__create_alerts_table.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V17__create_backup_restore_and_permissions_tables.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V18__refresh_permissions_master_data.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V19__create_production_lot_import_history.sql;
SOURCE /docker-entrypoint-initdb.d/migrations/V20__seed_role_permissions.sql;