package com.medicare.platform.controller;

import com.medicare.platform.dto.response.DailyStatsDto;
import com.medicare.platform.dto.response.DashboardStatsDto;
import com.medicare.platform.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AppointmentService appointmentService;

    public AdminDashboardController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * Statistiques globales du tableau de bord d'administration.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = appointmentService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Évolution journalière des demandes sur les 7 derniers jours (paramétrable 1-90).
     */
    @GetMapping("/daily-stats")
    public ResponseEntity<List<DailyStatsDto>> getDailyStats(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(appointmentService.getDailyStats(days));
    }
}
