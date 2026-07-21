package vn.nguongocso.auth.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;

public class SecurityUtils {

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new BusinessException("Chưa đăng nhập");
        }
        Object principal = auth.getPrincipal();
        if (!(principal instanceof CustomUserDetails)) {
            throw new BusinessException("Lỗi xác thực");
        }
        return (CustomUserDetails) principal;
    }
}
