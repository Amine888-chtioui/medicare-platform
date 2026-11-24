package com.medicare.platform.exception;

/**
 * Levée lorsqu'un trop grand nombre de tentatives de connexion échouées
 * est détecté pour un même couple adresse IP / identifiant.
 */
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
