-- =========================================================================
-- VT-01 (ADMIN)
-- =========================================================================
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'organization' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'organization' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'trace_code' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'trace_code' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'trace_code' AND action = 'ACTIVATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'alert' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'alert' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'activity_log' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'notification' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 1, (SELECT permission_id FROM permissions WHERE resource = 'product_feedback' AND action = 'READ'), b'1', NOW());

-- =========================================================================
-- VT-02 (ORG_MANAGER)
-- =========================================================================
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'organization' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'organization' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'farm_area' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'farm_area' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'farm_area' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'farm_area' AND action = 'DELETE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'production_lot' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'production_lot' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'production_lot' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'production_lot' AND action = 'APPROVE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'farm_log' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'farm_log' AND action = 'VERIFY'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'shipment' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'shipment' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'shipment' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'shipment' AND action = 'EXPORT'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'trace_code' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'organization_user' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'organization_user' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'organization_user' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'organization_user' AND action = 'DELETE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'role_permission' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'role_permission' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'notification' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'alert' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'report' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'report' AND action = 'EXPORT'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 2, (SELECT permission_id FROM permissions WHERE resource = 'product_feedback' AND action = 'READ'), b'1', NOW());

-- =========================================================================
-- VT-03 (EVENT_RECORDER)
-- =========================================================================
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 3, (SELECT permission_id FROM permissions WHERE resource = 'farm_log' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 3, (SELECT permission_id FROM permissions WHERE resource = 'farm_log' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 3, (SELECT permission_id FROM permissions WHERE resource = 'farm_log' AND action = 'UPDATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 3, (SELECT permission_id FROM permissions WHERE resource = 'chain_event' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 3, (SELECT permission_id FROM permissions WHERE resource = 'chain_event' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 3, (SELECT permission_id FROM permissions WHERE resource = 'notification' AND action = 'READ'), b'1', NOW());

-- =========================================================================
-- VT-04 (PROCUREMENT)
-- =========================================================================
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 4, (SELECT permission_id FROM permissions WHERE resource = 'chain_event' AND action = 'CREATE'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 4, (SELECT permission_id FROM permissions WHERE resource = 'chain_event' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 4, (SELECT permission_id FROM permissions WHERE resource = 'shipment' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 4, (SELECT permission_id FROM permissions WHERE resource = 'shipment' AND action = 'EXPORT'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 4, (SELECT permission_id FROM permissions WHERE resource = 'notification' AND action = 'READ'), b'1', NOW());

-- =========================================================================
-- VT-05 (REGULATOR)
-- =========================================================================
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 5, (SELECT permission_id FROM permissions WHERE resource = 'report' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 5, (SELECT permission_id FROM permissions WHERE resource = 'report' AND action = 'EXPORT'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 5, (SELECT permission_id FROM permissions WHERE resource = 'alert' AND action = 'READ'), b'1', NOW());
INSERT INTO role_permissions (id, role_id, permission_id, is_enabled, created_at) VALUES (UUID(), 5, (SELECT permission_id FROM permissions WHERE resource = 'notification' AND action = 'READ'), b'1', NOW());