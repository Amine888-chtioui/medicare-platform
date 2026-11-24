package com.medicare.platform.service;

import com.medicare.platform.dto.request.LoginRequestDto;
import com.medicare.platform.dto.response.LoginResponseDto;
import com.medicare.platform.entity.Admin;
import com.medicare.platform.repository.AdminRepository;
import com.medicare.platform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AdminAuthService adminAuthService;

    private Admin admin;

    @BeforeEach
    void setUp() {
        admin = new Admin("admin", "admin@example.com", "$2a$10$hashedpassword");
    }

    @Test
    @DisplayName("Devrait délivrer un JWT avec des identifiants valides")
    void shouldLoginWithValidCredentials() {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("secret", admin.getPassword())).thenReturn(true);
        when(tokenProvider.generateToken("admin")).thenReturn("jwt-token");
        when(tokenProvider.getExpirationMs()).thenReturn(28800000L);

        LoginResponseDto response = adminAuthService.login(new LoginRequestDto("admin", "secret"));

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(28800000L, response.getExpiresIn());
        assertEquals("admin", response.getUsername());
    }

    @Test
    @DisplayName("Devrait refuser un identifiant inconnu")
    void shouldRejectUnknownUsername() {
        when(adminRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class,
                () -> adminAuthService.login(new LoginRequestDto("ghost", "secret")));
        verifyNoInteractions(tokenProvider);
    }

    @Test
    @DisplayName("Devrait refuser un mot de passe incorrect")
    void shouldRejectWrongPassword() {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", admin.getPassword())).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> adminAuthService.login(new LoginRequestDto("admin", "wrong")));
        verify(tokenProvider, never()).generateToken(anyString());
    }
}
