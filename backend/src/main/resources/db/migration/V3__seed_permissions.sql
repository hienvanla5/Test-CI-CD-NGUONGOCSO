INSERT INTO permissions(resource, action, description)
VALUES

    ('USER','CREATE','Create user'),
    ('USER','READ','View user'),
    ('USER','UPDATE','Update user'),
    ('USER','DELETE','Delete user'),

    ('ORGANIZATION','CREATE','Create organization'),
    ('ORGANIZATION','READ','View organization'),
    ('ORGANIZATION','UPDATE','Update organization'),
    ('ORGANIZATION','DELETE','Delete organization'),

    ('ROLE','CREATE','Create role'),
    ('ROLE','READ','View role'),
    ('ROLE','UPDATE','Update role'),
    ('ROLE','DELETE','Delete role'),

    ('TRACEABILITY','CREATE','Create traceability'),
    ('TRACEABILITY','READ','View traceability'),
    ('TRACEABILITY','UPDATE','Update traceability'),
    ('TRACEABILITY','DELETE','Delete traceability');