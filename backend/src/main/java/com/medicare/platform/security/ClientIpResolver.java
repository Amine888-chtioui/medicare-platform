package com.medicare.platform.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Resolves the client IP used for rate limiting.
 *
 * <p>Forwarded headers are only trusted when the application is explicitly
 * deployed behind a reverse proxy ({@code app.trust-forwarded-headers=true}).
 * Otherwise a client could spoof {@code X-Forwarded-For} and bypass limits.</p>
 */
@Component
public class ClientIpResolver {

    private final boolean trustForwardedHeaders;

    public ClientIpResolver(@Value("${app.trust-forwarded-headers:false}") boolean trustForwardedHeaders) {
        this.trustForwardedHeaders = trustForwardedHeaders;
    }

    public String resolve(HttpServletRequest request) {
        if (trustForwardedHeaders) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
            String realIp = request.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank()) {
                return realIp.trim();
            }
        }
        return request.getRemoteAddr();
    }
}
