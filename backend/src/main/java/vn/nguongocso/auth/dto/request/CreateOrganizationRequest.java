package vn.nguongocso.auth.dto.request;

import vn.nguongocso.auth.enums.OrganizationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {

    // Thông tin tổ chức
	@NotBlank(message = "Tên tổ chức không được để trống")
    private String organizationName;
    
    @NotBlank(message = "Mã tổ chức không được để trống")
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