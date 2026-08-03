package vn.nguongocso.alert_reclaim_history.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.nguongocso.auth.service.CustomUserDetailsService;
import vn.nguongocso.common.PageResponse;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.config.SecurityConfig;
import vn.nguongocso.alert.controller.ActivityLogController;
import vn.nguongocso.alert.service.ActivityLogService;
import vn.nguongocso.alert_reclaim_history.service.ActivityLogServiceTest;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ActivityLogController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class ActivityLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ActivityLogService activityLogService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "VT-02") // Giả lập User đăng nhập thành công với Role Quản lý HTX
    void getActivityLogs_shouldReturnOk_whenUserIsOrgManager() throws Exception {

        PageResponse response = PageResponse.builder()
                .items(Collections.emptyList())
                .page(0)
                .size(10)
                .totalElements(0)
                .totalPages(0)
                .build();

        when(activityLogService.getActivityLogs(anyInt(), anyInt(), any(), any(), any(), any(), any()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/organizations/activity-logs")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isEmpty());
    }

    @Test
    @WithMockUser(roles = "VT-03") // Giả lập User đăng nhập với vai trò Người ghi sự kiện (không có quyền)
    void getActivityLogs_shouldReturnForbidden_whenUserHasWrongRole() throws Exception {

        mockMvc.perform(get("/api/v1/organizations/activity-logs")
                        .with(csrf()))
                .andExpect(status().isForbidden()); // Kiểm tra hệ thống có trả về lỗi 403 Forbidden không
    }

    @Test // Giả lập cuộc gọi nặc danh (không đính kèm JWT token)
    void getActivityLogs_shouldReturnUnauthorized_whenAnonymousUser() throws Exception {

        mockMvc.perform(get("/api/v1/organizations/activity-logs")
                        .with(csrf()))
                .andExpect(status().isUnauthorized()); // Kiểm tra hệ thống trả về lỗi 401 Unauthorized
    }
}
