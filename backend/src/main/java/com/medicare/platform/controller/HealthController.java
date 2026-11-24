package com.medicare.platform.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Minimal liveness endpoint used by deployment health checks.
 * It exposes no configuration or patient data.
 */
@RestController
@RequestMapping("/api/public")
public class HealthController {

    private final String appName;
    private final String appVersion;

    public HealthController(
            @Value("${app.name:MediCare Platform}") String appName,
            @Value("${app.version:1.0.0}") String appVersion
    ) {
        this.appName = appName;
        this.appVersion = appVersion;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("application", appName);
        body.put("version", appVersion);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}
