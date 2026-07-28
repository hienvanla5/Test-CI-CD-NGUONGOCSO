CREATE TABLE product_feedbacks (
                                   id CHAR(36) NOT NULL,
                                   production_lot_id CHAR(36) NOT NULL,
                                   content TEXT NOT NULL,
                                   created_at DATETIME NOT NULL,
                                   PRIMARY KEY (id),
                                   CONSTRAINT fk_product_feedbacks_production_lot
                                       FOREIGN KEY (production_lot_id) REFERENCES production_lot(id)
);

CREATE INDEX idx_product_feedbacks_production_lot ON product_feedbacks(production_lot_id);
