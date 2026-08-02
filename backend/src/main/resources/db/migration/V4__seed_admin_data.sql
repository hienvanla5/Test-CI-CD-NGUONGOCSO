INSERT INTO organizations
(
    organization_id,
    name,
    code,
    type,
    status,
    created_at,
    updated_at
)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Nguồn gốc số',
        'NGS',
        'SYSTEM',
        'ACTIVE',
        NOW(),
        NOW()
    );

INSERT INTO users
(
    user_id,
    user_name,
    password_hash,
    full_name,
    status,
    created_at,
    updated_at
)
VALUES
    (
        '22222222-2222-2222-2222-222222222222',
        'admin',
        '$2a$12$SnKVFmHpPHhDBjFWCEVgPuskmclqcsr/sb5eqkakiJPqm2hCCgbeK',
        'System Administrator',
        'ACTIVE',
        NOW(),
        NOW()
    );

INSERT INTO organization_users
(
    id,
    organization_id,
    user_id,
    role_id,
    joined_at,
    status
)
VALUES
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        1,
        NOW(),
        'ACTIVE'
    );