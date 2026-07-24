package vn.nguongocso.farm.event;

import org.springframework.context.ApplicationEvent;
import java.util.UUID;

public class PackagingValidationFailedEvent extends ApplicationEvent {
    private final UUID productionLotId;
    private final UUID organizationId;
    private final String lotName;

    public PackagingValidationFailedEvent(Object source, UUID productionLotId, UUID organizationId, String lotName) {
        super(source);
        this.productionLotId = productionLotId;
        this.organizationId = organizationId;
        this.lotName = lotName;
    }

    public UUID getProductionLotId() {
        return productionLotId;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getLotName() {
        return lotName;
    }
}
