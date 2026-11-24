package com.medicare.platform.security;

import com.medicare.platform.exception.RateLimitExceededException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LoginRateLimiterTest {

    @Test
    @DisplayName("Devrait bloquer après 5 échecs sur la même fenêtre")
    void shouldBlockAfterFiveFailures() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        String ip = "127.0.0.1";
        String username = "admin";

        for (int i = 0; i < 5; i++) {
            assertDoesNotThrow(() -> limiter.checkAllowed(ip, username));
            limiter.recordFailure(ip, username);
        }

        assertThrows(RateLimitExceededException.class, () -> limiter.checkAllowed(ip, username));
    }

    @Test
    @DisplayName("Devrait réinitialiser le compteur après une connexion réussie")
    void shouldResetAfterSuccess() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        limiter.recordFailure("127.0.0.1", "admin");
        limiter.reset("127.0.0.1", "admin");

        assertDoesNotThrow(() -> limiter.checkAllowed("127.0.0.1", "admin"));
    }

    @Test
    @DisplayName("Devrait isoler les compteurs par identifiant")
    void shouldIsolateCounters() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        for (int i = 0; i < 5; i++) {
            limiter.recordFailure("127.0.0.1", "admin");
        }

        assertDoesNotThrow(() -> limiter.checkAllowed("127.0.0.1", "other"));
    }
}
