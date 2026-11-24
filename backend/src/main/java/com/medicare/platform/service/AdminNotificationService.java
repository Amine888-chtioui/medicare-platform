package com.medicare.platform.service;

import com.medicare.platform.dto.response.AdminNotificationDto;
import com.medicare.platform.entity.AdminNotification;
import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.repository.AdminNotificationRepository;
import com.medicare.platform.repository.AppointmentRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdminNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(AdminNotificationService.class);

    private final AdminNotificationRepository notificationRepository;
    private final AppointmentRequestRepository appointmentRequestRepository;

    public AdminNotificationService(
            AdminNotificationRepository notificationRepository,
            AppointmentRequestRepository appointmentRequestRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.appointmentRequestRepository = appointmentRequestRepository;
    }

    /**
     * Crée une notification pour une demande de rendez-vous en attente.
     * Garantit l'absence stricte de doublons (vérification d'existence).
     */
    public Optional<AdminNotification> createNotification(AppointmentRequest request) {
        if (request == null || request.getId() == null) {
            return Optional.empty();
        }

        // Seules les demandes avec le statut EN_ATTENTE produisent une notification
        if (request.getStatus() != AppointmentStatus.EN_ATTENTE) {
            logger.debug("Skip notification: request ID {} is not in EN_ATTENTE status", request.getId());
            return Optional.empty();
        }

        // Pas de doublons
        if (notificationRepository.existsByAppointmentRequestId(request.getId())) {
            logger.debug("Notification already exists for request ID {}", request.getId());
            return notificationRepository.findByAppointmentRequestId(request.getId());
        }

        AdminNotification notification = new AdminNotification(request);
        AdminNotification saved = notificationRepository.save(notification);
        logger.info("Admin notification created for appointment request ID: {}", request.getId());
        return Optional.of(saved);
    }

    /**
     * Récupère la liste des notifications actives (non supprimées et dont la demande est toujours EN_ATTENTE).
     * Effectue une synchronisation transparente pour rattraper d'éventuelles demandes EN_ATTENTE
     * qui n'avaient pas encore d'entrée de notification.
     */
    @Transactional
    public List<AdminNotificationDto> getActiveNotifications() {
        // Auto-synchronisation des demandes EN_ATTENTE orphelines
        List<AppointmentRequest> pendingRequests = appointmentRequestRepository.findByStatus(AppointmentStatus.EN_ATTENTE);
        for (AppointmentRequest req : pendingRequests) {
            if (!notificationRepository.existsByAppointmentRequestId(req.getId())) {
                AdminNotification notif = new AdminNotification(req);
                notificationRepository.save(notif);
            }
        }

        return notificationRepository.findActiveNotifications(AppointmentStatus.EN_ATTENTE)
                .stream()
                .map(AdminNotificationDto::fromEntity)
                .toList();
    }

    /**
     * Nombre de notifications actives et non supprimées.
     */
    @Transactional(readOnly = true)
    public long getActiveCount() {
        return notificationRepository.countActiveNotifications(AppointmentStatus.EN_ATTENTE);
    }

    /**
     * Supprime (dismiss) une notification par son identifiant unique.
     * La suppression est persistante dans la base de données.
     * Ne supprime jamais la demande de rendez-vous associée.
     */
    public boolean dismissNotification(Long notificationId) {
        Optional<AdminNotification> opt = notificationRepository.findById(notificationId);
        if (opt.isPresent()) {
            AdminNotification notif = opt.get();
            notif.setDismissed(true);
            notif.setDismissedAt(LocalDateTime.now());
            notificationRepository.save(notif);
            logger.info("Admin notification ID {} dismissed (request ID: {})", notificationId,
                    notif.getAppointmentRequest() != null ? notif.getAppointmentRequest().getId() : "null");
            return true;
        }
        return false;
    }

    /**
     * Supprime (dismiss) la notification associée à une demande spécifique
     * (appelé par exemple lors de la confirmation ou du refus d'une demande).
     */
    public boolean dismissByAppointmentRequestId(Long appointmentRequestId) {
        if (appointmentRequestId == null) return false;
        return notificationRepository.findByAppointmentRequestId(appointmentRequestId)
                .map(notif -> {
                    notif.setDismissed(true);
                    notif.setDismissedAt(LocalDateTime.now());
                    notificationRepository.save(notif);
                    logger.info("Admin notification dismissed for appointment request ID {}", appointmentRequestId);
                    return true;
                }).orElse(false);
    }

    /**
     * Supprime (dismiss) toutes les notifications actives.
     * Ne supprime aucune demande de rendez-vous.
     */
    public int dismissAll() {
        int count = notificationRepository.dismissAllActive();
        logger.info("All active admin notifications dismissed (count: {})", count);
        return count;
    }
}
