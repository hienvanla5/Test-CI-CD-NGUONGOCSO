INSERT INTO role_permissions(id, role_id, permission_id, is_enabled, created_at)
VALUES
(UUID(), 2, 101, TRUE, NOW()),
(UUID(), 2, 102, TRUE, NOW()),
(UUID(), 2, 103, TRUE, NOW()),
(UUID(), 3, 201, TRUE, NOW()),
(UUID(), 3, 202, FALSE, NOW());