package vn.nguongocso.report.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierCheckResponse {
    private UUID shipmentId;
    private boolean eligible;
    private List<String> missingDocuments;
}
