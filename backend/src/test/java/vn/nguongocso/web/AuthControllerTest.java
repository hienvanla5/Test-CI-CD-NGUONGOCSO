package vn.nguongocso.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.nguongocso.auth.controller.AuthController;
import vn.nguongocso.auth.dto.request.LoginRequest;
import vn.nguongocso.auth.dto.response.LoginResponse;
import vn.nguongocso.auth.service.AuthService;
import vn.nguongocso.exception.BusinessException;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void login_withValidRequest_shouldReturn200() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("htx_manager");
        request.setPassword("123456");
        request.setOrganizationCode("HTX001");

        LoginResponse response = LoginResponse.builder()
                .accessToken("jwt-token")
                .expiresIn(86400L)
                .user(LoginResponse.UserInfo.builder()
                        .userId(UUID.randomUUID().toString())
                        .username("htx_manager")
                        .fullName("Nguyễn Văn A")
                        .roleCode("VT-02")
                        .organizationId(UUID.randomUUID().toString())
                        .organizationCode("HTX001")
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.user.username").value("htx_manager"));
    }

    @Test
    void login_withInvalidCredentials_shouldReturnBadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("htx_manager");
        request.setPassword("wrong");
        request.setOrganizationCode("HTX001");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BusinessException("Sai mật khẩu"));

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Sai mật khẩu"));
    }
}