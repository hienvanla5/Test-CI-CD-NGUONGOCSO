package vn.nguongocso.auth.dto.request;

import vn.nguongocso.auth.enums.OrganizationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {

    // Thông tin tổ chức
    private String organizationName;
    private String organizationCode;
    private OrganizationType organizationType;
    private String address;
    private String phone;
    private String email;

    // Thông tin tài khoản quản lý
    private String fullName;
    private String userName;
    private String password;
    private String managerPhone;
    private String managerEmail;
}