package com.medicare.platform.security;

import com.medicare.platform.exception.RateLimitExceededException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Protection simple contre les attaques par force brute sur la connexion
 * administrateur. Implémentation en mémoire, volontairement sans dépendance
 * externe (pas de Redis) : suffisante pour un cabinet mono-administrateur.
 *
 * Règle : 5 échecs maximum par couple IP / identifiant sur une fenêtre de 15 minutes.
 * Un succès remet le compteur à zéro.
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int CLEANUP_THRESHOLD = 10_000;

    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public void checkAllowed(String ipAddress, String username) {
        String key = key(ipAddress, username);
        Deque<Instant> attempts = failures.get(key);
        if (attempts == null) {
            return;
        }

        Instant cutoff = Instant.now().minus(WINDOW);
        synchronized (attempts) {
            prune(attempts, cutoff);
            if (attempts.isEmpty()) {
                failures.remove(key);
                return;
            }
            if (attempts.size() >= MAX_FAILURES) {
                Instant oldest = attempts.peekFirst();
                long retryAfter = oldest == null
                        ? WINDOW.toSeconds()
                        : Math.max(1, Duration.between(Instant.now(), oldest.plus(WINDOW)).toSeconds());
                throw new RateLimitExceededException(
                        "Trop de tentatives de connexion. Veuillez réessayer dans " + retryAfter + " secondes.",
                        retryAfter
                );
            }
        }
    }

    public void recordFailure(String ipAddress, String username) {
        if (failures.size() > CLEANUP_THRESHOLD) {
            cleanup();
        }
        String key = key(ipAddress, username);
        Deque<Instant> attempts = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (attempts) {
            prune(attempts, Instant.now().minus(WINDOW));
            attempts.addLast(Instant.now());
        }
    }

    public void reset(String ipAddress, String username) {
        failures.remove(key(ipAddress, username));
    }

    private void prune(Deque<Instant> attempts, Instant cutoff) {
        while (!attempts.isEmpty() && attempts.peekFirst().isBefore(cutoff)) {
            attempts.pollFirst();
        }
    }

    private void cleanup() {
        Instant cutoff = Instant.now().minus(WINDOW);
        failures.entrySet().removeIf(entry -> {
            Deque<Instant> attempts = entry.getValue();
            synchronized (attempts) {
                prune(attempts, cutoff);
                return attempts.isEmpty();
            }
        });
    }

    private String key(String ipAddress, String username) {
        String safeIp = (ipAddress == null || ipAddress.isBlank()) ? "unknown" : ipAddress;
        String safeUsername = (username == null) ? "" : username.trim().toLowerCase();
        return safeIp + "|" + safeUsername;
    }
}
