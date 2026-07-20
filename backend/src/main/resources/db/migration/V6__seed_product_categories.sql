-- Seed dữ liệu danh mục loại cây trồng

INSERT INTO product_categories (id, name, category_group, description, is_active)
VALUES
(UUID(), 'Chè', 'Cây công nghiệp', 'Cây chè', TRUE),

(UUID(), 'Lúa', 'Cây lương thực', 'Cây lúa', TRUE),

(UUID(), 'Ngô', 'Cây lương thực', 'Cây ngô', TRUE),

(UUID(), 'Cà phê', 'Cây công nghiệp', 'Cây cà phê', TRUE),

(UUID(), 'Hồ tiêu', 'Cây công nghiệp', 'Cây hồ tiêu', TRUE),

(UUID(), 'Cam', 'Cây ăn quả', 'Cây cam', TRUE),

(UUID(), 'Bưởi', 'Cây ăn quả', 'Cây bưởi', TRUE),

(UUID(), 'Chuối', 'Cây ăn quả', 'Cây chuối', TRUE),

(UUID(), 'Thanh long', 'Cây ăn quả', 'Cây thanh long', TRUE),

(UUID(), 'Xoài', 'Cây ăn quả', 'Cây xoài', TRUE);
