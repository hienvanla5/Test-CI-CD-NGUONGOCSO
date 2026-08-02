package vn.nguongocso.farm.event;

import org.springframework.context.ApplicationEvent;
import java.util.UUID;

public class ProductFeedbackSubmittedEvent extends ApplicationEvent {
    private final UUID feedbackId;
    private final UUID productionLotId;
    private final String productionLotName;
    private final UUID organizationId;
    private final String content;

    public ProductFeedbackSubmittedEvent(Object source, UUID feedbackId, UUID productionLotId, String productionLotName, UUID organizationId, String content) {
        super(source);
        this.feedbackId = feedbackId;
        this.productionLotId = productionLotId;
        this.productionLotName = productionLotName;
        this.organizationId = organizationId;
        this.content = content;
    }

    public UUID getFeedbackId() {
        return feedbackId;
    }

    public UUID getProductionLotId() {
        return productionLotId;
    }

    public String getProductionLotName() {
        return productionLotName;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getContent() {
        return content;
    }
}
