package vn.nguongocso.organization.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddExistingUserRequest {

    @NotNull(message = "userId không được để trống")
    private UUID userId;

    private Integer roleId; // optional, nếu không có sẽ giữ vai trò hiện tại
}