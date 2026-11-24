package com.medicare.platform.service;

import com.medicare.platform.dto.request.CreateAppointmentRequestDto;
import com.medicare.platform.dto.request.UpdateStatusRequestDto;
import com.medicare.platform.dto.response.AppointmentResponseDto;
import com.medicare.platform.dto.response.DailyStatsDto;
import com.medicare.platform.dto.response.DashboardStatsDto;
import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.entity.Patient;
import com.medicare.platform.exception.ResourceNotFoundException;
import com.medicare.platform.repository.AppointmentRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRequestRepository repository;
    private final AdminNotificationService notificationService;
    private final PatientService patientService;

    public AppointmentService(
            AppointmentRequestRepository repository,
            AdminNotificationService notificationService,
            PatientService patientService
    ) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.patientService = patientService;
    }

    /**
     * Crée une nouvelle demande de rendez-vous avec le statut initial EN_ATTENTE.
     */
    public AppointmentResponseDto createAppointment(CreateAppointmentRequestDto dto) {
        // Never log patient names or phone numbers (privacy by design, loi 09-08).
        logger.info("Creating new appointment request");

        AppointmentRequest request = new AppointmentRequest();
        request.setFullName(dto.getFullName().trim());
        request.setPhoneNumber(dto.getPhoneNumber().trim());
        request.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        request.setAppointmentDate(dto.getAppointmentDate());
        request.setStartTime(dto.getStartTime());
        request.setEndTime(dto.getEndTime());
        request.setServiceType(dto.getServiceType() != null ? dto.getServiceType() : "Consultation");
        request.setStatus(AppointmentStatus.EN_ATTENTE);

        AppointmentRequest saved = repository.save(request);
        logger.info("Appointment request created with ID: {}", saved.getId());

        // Création de la notification pour l'administrateur
        try {
            if (notificationService != null) {
                notificationService.createNotification(saved);
            }
        } catch (Exception ex) {
            logger.warn("Could not create notification for request {}: {}", saved.getId(), ex.getMessage());
        }

        return AppointmentResponseDto.fromEntity(saved);
    }

    /**
     * Récupère la liste paginée des demandes avec filtres optionnels de statut et de recherche.
     */
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> getAllAppointments(
            AppointmentStatus status,
            String search,
            Pageable pageable
    ) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return repository.search(status, cleanSearch, pageable)
                .map(AppointmentResponseDto::fromEntity);
    }

    /**
     * Récupère une demande par son identifiant unique.
     */
    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long id) {
        AppointmentRequest entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de rendez-vous introuvable avec l'ID : " + id));
        return AppointmentResponseDto.fromEntity(entity);
    }

    /**
     * Met à jour le statut d'une demande (EN_ATTENTE, CONFIRMEE, REFUSEE),
     * avec possibilité de valider telle quelle ou de modifier la date/heure souhaitée.
     * En cas de confirmation, vérifie strictement les conflits de créneau horaire.
     */
    public AppointmentResponseDto updateStatus(Long id, UpdateStatusRequestDto dto) {
        AppointmentRequest entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de rendez-vous introuvable avec l'ID : " + id));

        AppointmentStatus oldStatus = entity.getStatus();
        AppointmentStatus newStatus = dto.getStatus();

        // Si l'administrateur modifie la proposition de date ou d'heure
        if (dto.getAppointmentDate() != null) {
            entity.setAppointmentDate(dto.getAppointmentDate());
        }
        if (dto.getStartTime() != null && !dto.getStartTime().trim().isEmpty()) {
            entity.setStartTime(dto.getStartTime().trim());
            if (dto.getEndTime() != null && !dto.getEndTime().trim().isEmpty()) {
                entity.setEndTime(dto.getEndTime().trim());
            } else {
                // Calcule automatiquement +30 minutes
                try {
                    String[] parts = dto.getStartTime().trim().split(":");
                    int h = Integer.parseInt(parts[0]);
                    int m = Integer.parseInt(parts[1]) + 30;
                    if (m >= 60) {
                        h += 1;
                        m -= 60;
                    }
                    entity.setEndTime(String.format("%02d:%02d", h, m));
                } catch (Exception ignored) {
                }
            }
        }

        // Si confirmation, vérification stricte des conflits et création/liaison du dossier patient
        if (newStatus == AppointmentStatus.CONFIRMEE) {
            if (entity.getAppointmentDate() != null && entity.getStartTime() != null) {
                boolean conflict = repository.existsConflict(
                        entity.getAppointmentDate(),
                        entity.getStartTime(),
                        entity.getId()
                );
                if (conflict) {
                    throw new IllegalArgumentException("Ce créneau horaire (" + entity.getStartTime() + ") est déjà occupé par un autre rendez-vous le " + entity.getAppointmentDate() + ". Veuillez choisir un autre horaire.");
                }
            }

            // Création ou rattachement sécurisé au dossier patient (idempotent, sans doublon)
            if (patientService != null) {
                Patient patient = patientService.getOrCreatePatient(entity.getFullName(), entity.getPhoneNumber());
                entity.setPatient(patient);
            }

            // Clôture de la notification liée à cette demande
            try {
                if (notificationService != null) {
                    notificationService.dismissByAppointmentRequestId(entity.getId());
                }
            } catch (Exception ex) {
                logger.warn("Could not dismiss notification for request {}: {}", entity.getId(), ex.getMessage());
            }
        } else if (newStatus == AppointmentStatus.REFUSEE) {
            // Lors d'un refus : aucun dossier patient n'est créé
            // La notification est également clôturée
            try {
                if (notificationService != null) {
                    notificationService.dismissByAppointmentRequestId(entity.getId());
                }
            } catch (Exception ex) {
                logger.warn("Could not dismiss notification for request {}: {}", entity.getId(), ex.getMessage());
            }
        }

        logger.info("Updating appointment request ID {} status: {} -> {}", id, oldStatus, newStatus);
        entity.setStatus(newStatus);

        AppointmentRequest updated = repository.save(entity);
        return AppointmentResponseDto.fromEntity(updated);
    }

    /**
     * Calcule les statistiques globales du tableau de bord.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long total = repository.count();
        long enAttente = repository.countByStatus(AppointmentStatus.EN_ATTENTE);
        long confirmees = repository.countByStatus(AppointmentStatus.CONFIRMEE);
        long refusees = repository.countByStatus(AppointmentStatus.REFUSEE);

        return new DashboardStatsDto(total, enAttente, confirmees, refusees);
    }

    /**
     * Nombre de demandes reçues par jour sur les N derniers jours (N inclus aujourd'hui).
     * Les jours sans demande sont renvoyés avec un compteur à zéro afin que le
     * graphique du tableau de bord reste lisible.
     */
    @Transactional(readOnly = true)
    public List<DailyStatsDto> getDailyStats(int days) {
        int safeDays = Math.min(Math.max(days, 1), 90);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(safeDays - 1L);
        LocalDateTime start = startDate.atStartOfDay();

        Map<LocalDate, Long> counts = new LinkedHashMap<>();
        for (int i = 0; i < safeDays; i++) {
            counts.put(startDate.plusDays(i), 0L);
        }

        repository.findByCreatedAtAfterOrderByCreatedAtAsc(start).forEach(request -> {
            if (request.getCreatedAt() != null) {
                LocalDate day = request.getCreatedAt().toLocalDate();
                counts.computeIfPresent(day, (key, value) -> value + 1);
            }
        });

        List<DailyStatsDto> result = new ArrayList<>(safeDays);
        counts.forEach((date, count) -> result.add(new DailyStatsDto(date, count)));
        return result;
    }

    /**
     * Crée un rendez-vous planifié côté administrateur avec vérification des conflits.
     */
    public AppointmentResponseDto createAdminAppointment(CreateAppointmentRequestDto dto) {
        if (dto.getAppointmentDate() != null && dto.getStartTime() != null) {
            boolean conflict = repository.existsConflict(
                    dto.getAppointmentDate(),
                    dto.getStartTime(),
                    null
            );
            if (conflict) {
                throw new IllegalArgumentException("Ce créneau horaire (" + dto.getStartTime() + ") est déjà occupé par un autre rendez-vous le " + dto.getAppointmentDate());
            }
        }

        AppointmentRequest request = new AppointmentRequest();
        request.setFullName(dto.getFullName().trim());
        request.setPhoneNumber(dto.getPhoneNumber().trim());
        request.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        request.setAppointmentDate(dto.getAppointmentDate());
        request.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null && !dto.getEndTime().trim().isEmpty()) {
            request.setEndTime(dto.getEndTime().trim());
        } else if (dto.getStartTime() != null && !dto.getStartTime().trim().isEmpty()) {
            try {
                String[] parts = dto.getStartTime().trim().split(":");
                int h = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]) + 30;
                if (m >= 60) {
                    h += 1;
                    m -= 60;
                }
                request.setEndTime(String.format("%02d:%02d", h, m));
            } catch (Exception ignored) {
            }
        }
        request.setServiceType(dto.getServiceType() != null ? dto.getServiceType() : "Consultation");
        request.setStatus(AppointmentStatus.CONFIRMEE);

        AppointmentRequest saved = repository.save(request);

        // Lier/Créer le dossier patient pour un rendez-vous confirmé côté admin
        if (patientService != null) {
            Patient patient = patientService.getOrCreatePatient(saved.getFullName(), saved.getPhoneNumber());
            saved.setPatient(patient);
            saved = repository.save(saved);
        }

        return AppointmentResponseDto.fromEntity(saved);
    }

    /**
     * Récupère le planning des rendez-vous entre deux dates.
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getSchedule(LocalDate startDate, LocalDate endDate) {
        return repository.findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscStartTimeAsc(startDate, endDate, AppointmentStatus.CONFIRMEE)
                .stream()
                .map(AppointmentResponseDto::fromEntity)
                .toList();
    }

    /**
     * Vérifie s'il existe un conflit horaire.
     */
    @Transactional(readOnly = true)
    public boolean checkConflict(LocalDate date, String startTime, Long excludeId) {
        if (date == null || startTime == null) return false;
        return repository.existsConflict(date, startTime, excludeId);
    }
}
