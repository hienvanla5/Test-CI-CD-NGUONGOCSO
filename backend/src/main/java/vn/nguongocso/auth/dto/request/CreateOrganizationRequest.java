package vn.nguongocso.auth.dto.request;

import vn.nguongocso.auth.enums.OrganizationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @NotBlank(message = "Họ tên người quản lý không được để trống")
    private String fullName;
    
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String userName;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;
    
    private String managerPhone;
    
    @NotBlank(message = "Email người quản lý không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String managerEmail;
}