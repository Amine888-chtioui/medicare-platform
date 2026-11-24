package com.medicare.platform.service;

import com.medicare.platform.dto.response.AdminNotificationDto;
import com.medicare.platform.entity.AdminNotification;
import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.repository.AdminNotificationRepository;
import com.medicare.platform.repository.AppointmentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminNotificationServiceTest {

    @Mock
    private AdminNotificationRepository notificationRepository;

    @Mock
    private AppointmentRequestRepository appointmentRequestRepository;

    @InjectMocks
    private AdminNotificationService notificationService;

    private AppointmentRequest samplePendingRequest;

    @BeforeEach
    void setUp() {
        samplePendingRequest = new AppointmentRequest("Yassine Benali", "0606434374", "Première consultation");
        samplePendingRequest.setId(42L);
        samplePendingRequest.setStatus(AppointmentStatus.EN_ATTENTE);
        samplePendingRequest.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Crée une notification pour une demande avec le statut EN_ATTENTE")
    void shouldCreateNotificationForPendingRequest() {
        when(notificationRepository.existsByAppointmentRequestId(42L)).thenReturn(false);
        when(notificationRepository.save(any(AdminNotification.class))).thenAnswer(inv -> {
            AdminNotification n = inv.getArgument(0);
            n.setId(101L);
            return n;
        });

        Optional<AdminNotification> result = notificationService.createNotification(samplePendingRequest);

        assertTrue(result.isPresent());
        assertEquals(101L, result.get().getId());
        assertEquals(42L, result.get().getAppointmentRequest().getId());
        assertFalse(result.get().isDismissed());
        verify(notificationRepository, times(1)).save(any(AdminNotification.class));
    }

    @Test
    @DisplayName("Ne crée pas de notification pour une demande confirmée ou refusée")
    void shouldNotCreateNotificationForNonPendingRequest() {
        samplePendingRequest.setStatus(AppointmentStatus.CONFIRMEE);

        Optional<AdminNotification> result = notificationService.createNotification(samplePendingRequest);

        assertTrue(result.isEmpty());
        verify(notificationRepository, never()).save(any(AdminNotification.class));
    }

    @Test
    @DisplayName("Évite la création de doublons si une notification existe déjà pour la demande")
    void shouldNotDuplicateNotification() {
        AdminNotification existing = new AdminNotification(samplePendingRequest);
        existing.setId(99L);

        when(notificationRepository.existsByAppointmentRequestId(42L)).thenReturn(true);
        when(notificationRepository.findByAppointmentRequestId(42L)).thenReturn(Optional.of(existing));

        Optional<AdminNotification> result = notificationService.createNotification(samplePendingRequest);

        assertTrue(result.isPresent());
        assertEquals(99L, result.get().getId());
        verify(notificationRepository, never()).save(any(AdminNotification.class));
    }

    @Test
    @DisplayName("Supprime une notification de manière persistante sans toucher à la demande")
    void shouldDismissSingleNotification() {
        AdminNotification notif = new AdminNotification(samplePendingRequest);
        notif.setId(10L);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notif));

        boolean dismissed = notificationService.dismissNotification(10L);

        assertTrue(dismissed);
        assertTrue(notif.isDismissed());
        assertNotNull(notif.getDismissedAt());
        // Vérifie que la demande de rendez-vous est intacte
        assertEquals(AppointmentStatus.EN_ATTENTE, samplePendingRequest.getStatus());
        verify(notificationRepository).save(notif);
        verify(appointmentRequestRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Supprime toutes les notifications sans supprimer les demandes")
    void shouldDismissAllActiveNotifications() {
        when(notificationRepository.dismissAllActive()).thenReturn(5);

        int count = notificationService.dismissAll();

        assertEquals(5, count);
        verify(notificationRepository).dismissAllActive();
        verify(appointmentRequestRepository, never()).deleteAll();
    }
}
