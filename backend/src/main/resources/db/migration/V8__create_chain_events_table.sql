CREATE TABLE chain_events (
                              id CHAR(36) PRIMARY KEY,
                              shipment_id CHAR(36) NULL,
                              event_type VARCHAR(50) NOT NULL,
                              event_data JSON NULL,
                              location GEOMETRY NULL,
                              recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              recorded_by CHAR(36) NOT NULL,
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              parent_event_id CHAR(36) NULL,
                              is_correction BOOLEAN DEFAULT FALSE,

                              CONSTRAINT fk_chain_event_shipment
                                  FOREIGN KEY (shipment_id) REFERENCES shipments(id),

                              CONSTRAINT fk_chain_event_recorded_by
                                  FOREIGN KEY (recorded_by) REFERENCES users(user_id),

                              CONSTRAINT fk_chain_event_parent
                                  FOREIGN KEY (parent_event_id) REFERENCES chain_events(id)
);