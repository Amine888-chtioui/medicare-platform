package com.medicare.platform.controller;

import com.medicare.platform.dto.request.LoginRequestDto;
import com.medicare.platform.dto.response.ApiResponse;
import com.medicare.platform.dto.response.LoginResponseDto;
import com.medicare.platform.security.ClientIpResolver;
import com.medicare.platform.security.LoginRateLimiter;
import com.medicare.platform.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService authService;
    private final LoginRateLimiter loginRateLimiter;
    private final ClientIpResolver clientIpResolver;

    public AdminAuthController(
            AdminAuthService authService,
            LoginRateLimiter loginRateLimiter,
            ClientIpResolver clientIpResolver
    ) {
        this.authService = authService;
        this.loginRateLimiter = loginRateLimiter;
        this.clientIpResolver = clientIpResolver;
    }

    /**
     * Authentification administrateur et délivrance du JWT.
     * Les tentatives échouées sont limitées par couple IP / identifiant.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @Valid @RequestBody LoginRequestDto loginRequest,
            HttpServletRequest request) {

        String clientIp = clientIpResolver.resolve(request);
        String username = loginRequest.getUsername();

        loginRateLimiter.checkAllowed(clientIp, username);
        try {
            LoginResponseDto response = authService.login(loginRequest);
            loginRateLimiter.reset(clientIp, username);
            return ResponseEntity.ok(ApiResponse.success("Connexion réussie", response));
        } catch (BadCredentialsException ex) {
            loginRateLimiter.recordFailure(clientIp, username);
            throw ex;
        }
    }
}
