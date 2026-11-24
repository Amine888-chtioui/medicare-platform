package com.medicare.platform.service;

import com.medicare.platform.dto.request.LoginRequestDto;
import com.medicare.platform.dto.response.LoginResponseDto;
import com.medicare.platform.entity.Admin;
import com.medicare.platform.repository.AdminRepository;
import com.medicare.platform.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminAuthService {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthService.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AdminAuthService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponseDto login(LoginRequestDto loginRequest) {
        String username = loginRequest.getUsername() == null ? "" : loginRequest.getUsername().trim();
        logger.info("Authentication attempt for user: {}", username);

        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Identifiant ou mot de passe incorrect"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
            logger.warn("Password mismatch for user: {}", username);
            throw new BadCredentialsException("Identifiant ou mot de passe incorrect");
        }

        String token = tokenProvider.generateToken(admin.getUsername());
        long expiresIn = tokenProvider.getExpirationMs();

        logger.info("Authentication successful for user: {}", admin.getUsername());
        return new LoginResponseDto(token, expiresIn, admin.getUsername());
    }
}
