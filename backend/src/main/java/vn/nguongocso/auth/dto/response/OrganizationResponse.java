package vn.nguongocso.auth.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import vn.nguongocso.auth.enums.OrganizationStatus;
import vn.nguongocso.auth.enums.OrganizationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {

    private UUID organizationID;

    private String organizationName;

    private String organizationCode;

    private OrganizationType organizationType;

    private OrganizationStatus status;

    private LocalDateTime createdAt;
}