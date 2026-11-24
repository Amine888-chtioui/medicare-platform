package com.medicare.platform.security;

import com.medicare.platform.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight anti-spam protection for the public appointment form.
 *
 * <p>In-memory on purpose: a single-instance clinic deployment does not need
 * Redis or another external store. The limit is configurable so it can be
 * relaxed or tightened without a code change.</p>
 */
@Component
public class PublicRequestRateLimiter {

    private static final int CLEANUP_THRESHOLD = 10_000;

    private final int maxRequests;
    private final Duration window;
    private final Map<String, Deque<Instant>> requests = new ConcurrentHashMap<>();

    public PublicRequestRateLimiter(
            @Value("${public.rate-limit.max-requests:10}") int maxRequests,
            @Value("${public.rate-limit.window-minutes:60}") long windowMinutes
    ) {
        this.maxRequests = Math.max(1, maxRequests);
        this.window = Duration.ofMinutes(Math.max(1, windowMinutes));
    }

    public void checkAllowed(String ipAddress) {
        String key = key(ipAddress);
        Deque<Instant> attempts = requests.get(key);
        if (attempts == null) {
            return;
        }

        Instant cutoff = Instant.now().minus(window);
        synchronized (attempts) {
            prune(attempts, cutoff);
            if (attempts.isEmpty()) {
                requests.remove(key);
                return;
            }
            if (attempts.size() >= maxRequests) {
                Instant oldest = attempts.peekFirst();
                long retryAfter = oldest == null
                        ? window.toSeconds()
                        : Math.max(1, Duration.between(Instant.now(), oldest.plus(window)).toSeconds());
                throw new RateLimitExceededException(
                        "Trop de demandes envoyées. Veuillez réessayer dans " + retryAfter + " secondes.",
                        retryAfter
                );
            }
        }
    }

    public void recordRequest(String ipAddress) {
        if (requests.size() > CLEANUP_THRESHOLD) {
            cleanup();
        }
        String key = key(ipAddress);
        Deque<Instant> attempts = requests.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (attempts) {
            prune(attempts, Instant.now().minus(window));
            attempts.addLast(Instant.now());
        }
    }

    private void prune(Deque<Instant> attempts, Instant cutoff) {
        while (!attempts.isEmpty() && attempts.peekFirst().isBefore(cutoff)) {
            attempts.pollFirst();
        }
    }

    private void cleanup() {
        Instant cutoff = Instant.now().minus(window);
        requests.entrySet().removeIf(entry -> {
            Deque<Instant> attempts = entry.getValue();
            synchronized (attempts) {
                prune(attempts, cutoff);
                return attempts.isEmpty();
            }
        });
    }

    private String key(String ipAddress) {
        return (ipAddress == null || ipAddress.isBlank()) ? "unknown" : ipAddress;
    }
}
