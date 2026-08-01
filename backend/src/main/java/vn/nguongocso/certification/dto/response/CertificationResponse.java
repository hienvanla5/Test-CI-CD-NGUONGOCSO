package vn.nguongocso.certification.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CertificationResponse {
    private UUID id;
    private String name;
    private String code;
    private String issuedBy;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private Boolean isValid; // true nếu expiryDate >= hôm nay
}