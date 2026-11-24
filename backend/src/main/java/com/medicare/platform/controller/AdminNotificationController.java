package com.medicare.platform.controller;

import com.medicare.platform.dto.response.AdminNotificationDto;
import com.medicare.platform.dto.response.ApiResponse;
import com.medicare.platform.service.AdminNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    public AdminNotificationController(AdminNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Liste des notifications actives (nouvelles demandes EN_ATTENTE non supprimées).
     */
    @GetMapping
    public ResponseEntity<List<AdminNotificationDto>> getActiveNotifications() {
        return ResponseEntity.ok(notificationService.getActiveNotifications());
    }

    /**
     * Nombre de notifications actives pour le badge du header.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getActiveCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getActiveCount()));
    }

    /**
     * Suppression (dismiss) d'une notification individuelle.
     * Ne supprime jamais la demande de rendez-vous sous-jacente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> dismissNotification(@PathVariable Long id) {
        boolean dismissed = notificationService.dismissNotification(id);
        if (dismissed) {
            return ResponseEntity.ok(ApiResponse.success("Notification supprimée avec succès", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Notification déjà traitée ou introuvable", null));
    }

    /**
     * Suppression globale de toutes les notifications actives (« Tout supprimer »).
     * Ne supprime aucune demande de rendez-vous.
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Map<String, Integer>>> dismissAll() {
        int count = notificationService.dismissAll();
        return ResponseEntity.ok(ApiResponse.success("Toutes les notifications ont été supprimées", Map.of("dismissedCount", count)));
    }
}
