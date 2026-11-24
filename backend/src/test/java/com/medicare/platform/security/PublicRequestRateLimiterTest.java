package com.medicare.platform.security;

import com.medicare.platform.exception.RateLimitExceededException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PublicRequestRateLimiterTest {

    @Test
    @DisplayName("Devrait bloquer une IP après le nombre maximal de demandes")
    void shouldBlockAfterMaxRequests() {
        PublicRequestRateLimiter limiter = new PublicRequestRateLimiter(3, 60);

        for (int i = 0; i < 3; i++) {
            assertDoesNotThrow(() -> limiter.checkAllowed("127.0.0.1"));
            limiter.recordRequest("127.0.0.1");
        }

        assertThrows(RateLimitExceededException.class, () -> limiter.checkAllowed("127.0.0.1"));
    }

    @Test
    @DisplayName("Devrait isoler les limites par adresse IP")
    void shouldIsolateLimitsPerIp() {
        PublicRequestRateLimiter limiter = new PublicRequestRateLimiter(2, 60);
        limiter.recordRequest("10.0.0.1");
        limiter.recordRequest("10.0.0.1");

        assertDoesNotThrow(() -> limiter.checkAllowed("10.0.0.2"));
    }
}
