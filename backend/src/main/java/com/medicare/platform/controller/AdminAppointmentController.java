package com.medicare.platform.controller;

import com.medicare.platform.dto.request.CreateAppointmentRequestDto;
import com.medicare.platform.dto.request.UpdateStatusRequestDto;
import com.medicare.platform.dto.response.ApiResponse;
import com.medicare.platform.dto.response.AppointmentResponseDto;
import com.medicare.platform.dto.response.PageResponseDto;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/appointment-requests")
public class AdminAppointmentController {

    private final AppointmentService appointmentService;

    public AdminAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * Planning hebdomadaire / mensuel des rendez-vous entre deux dates.
     */
    @GetMapping("/schedule")
    public ResponseEntity<List<AppointmentResponseDto>> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(appointmentService.getSchedule(startDate, endDate));
    }

    /**
     * Vérification de disponibilité / conflit d'un créneau horaire.
     */
    @GetMapping("/check-conflict")
    public ResponseEntity<Map<String, Boolean>> checkConflict(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String startTime,
            @RequestParam(required = false) Long excludeId) {
        boolean conflict = appointmentService.checkConflict(date, startTime, excludeId);
        return ResponseEntity.ok(Map.of("conflict", conflict));
    }

    /**
     * Création directe d'un rendez-vous par l'administrateur avec vérification de conflit.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> createAdminAppointment(
            @Valid @RequestBody CreateAppointmentRequestDto dto) {
        AppointmentResponseDto created = appointmentService.createAdminAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rendez-vous planifié avec succès", created));
    }

    /**
     * Liste paginée des demandes avec filtrage par statut et recherche textuelle.
     */
    @GetMapping
    public ResponseEntity<PageResponseDto<AppointmentResponseDto>> getAllAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AppointmentResponseDto> page = appointmentService.getAllAppointments(status, search, pageable);
        return ResponseEntity.ok(PageResponseDto.from(page, dto -> dto));
    }

    /**
     * Consultation des détails d'une demande par ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDto dto = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Demande trouvée", dto));
    }

    /**
     * Modification du statut d'une demande (EN_ATTENTE, CONFIRMEE, REFUSEE).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequestDto dto) {
        AppointmentResponseDto updated = appointmentService.updateStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Statut mis à jour avec succès", updated));
    }
}
