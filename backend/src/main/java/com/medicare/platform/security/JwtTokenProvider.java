package com.medicare.platform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    /** Valeur de développement présente dans application.properties. */
    private static final String DEFAULT_DEV_SECRET =
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:" + DEFAULT_DEV_SECRET + "}") String secret,
            @Value("${jwt.expiration-ms:28800000}") long expirationMs,
            @Value("${spring.profiles.active:}") String activeProfiles
    ) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "La clé JWT doit contenir au moins 32 octets. Configurez JWT_SECRET.");
        }
        if (activeProfiles.contains("prod") && DEFAULT_DEV_SECRET.equals(secret)) {
            throw new IllegalStateException(
                    "La clé JWT par défaut est interdite en production. Configurez JWT_SECRET avec une valeur aléatoire.");
        }
        if (DEFAULT_DEV_SECRET.equals(secret)) {
            logger.warn("Using the default development JWT secret. Set JWT_SECRET before production.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
