package com.medicare.platform.service;

import com.medicare.platform.dto.request.CreateAppointmentRequestDto;
import com.medicare.platform.dto.request.UpdateStatusRequestDto;
import com.medicare.platform.dto.response.AppointmentResponseDto;
import com.medicare.platform.dto.response.DailyStatsDto;
import com.medicare.platform.dto.response.DashboardStatsDto;
import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.exception.ResourceNotFoundException;
import com.medicare.platform.repository.AppointmentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRequestRepository repository;

    @Mock
    private AdminNotificationService notificationService;

    @Mock
    private PatientService patientService;

    @InjectMocks
    private AppointmentService appointmentService;

    private AppointmentRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleRequest = new AppointmentRequest("Fatima Zahra", "0612345678", "Consultation de suivi");
        sampleRequest.setId(1L);
        sampleRequest.setStatus(AppointmentStatus.EN_ATTENTE);
        sampleRequest.setCreatedAt(LocalDateTime.now());
        sampleRequest.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Devrait créer une demande avec le statut initial EN_ATTENTE")
    void shouldCreateAppointmentWithPendingStatus() {
        CreateAppointmentRequestDto dto = new CreateAppointmentRequestDto(
                "Fatima Zahra", "0612345678", "Consultation de suivi"
        );

        when(repository.save(any(AppointmentRequest.class))).thenAnswer(invocation -> {
            AppointmentRequest req = invocation.getArgument(0);
            req.setId(10L);
            req.setCreatedAt(LocalDateTime.now());
            req.setUpdatedAt(LocalDateTime.now());
            return req;
        });

        AppointmentResponseDto result = appointmentService.createAppointment(dto);

        assertNotNull(result);
        assertEquals("Fatima Zahra", result.getFullName());
        assertEquals("0612345678", result.getPhoneNumber());
        assertEquals(AppointmentStatus.EN_ATTENTE, result.getStatus());
        verify(repository, times(1)).save(any(AppointmentRequest.class));
    }

    @Test
    @DisplayName("Devrait trouver une demande par son identifiant")
    void shouldFindAppointmentById() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleRequest));

        AppointmentResponseDto result = appointmentService.getAppointmentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Fatima Zahra", result.getFullName());
    }

    @Test
    @DisplayName("Devrait lancer ResourceNotFoundException si la demande n'existe pas")
    void shouldThrowExceptionWhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getAppointmentById(99L));
    }

    @Test
    @DisplayName("Devrait modifier le statut d'une demande")
    void shouldUpdateStatus() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleRequest));
        when(repository.save(any(AppointmentRequest.class))).thenReturn(sampleRequest);

        UpdateStatusRequestDto updateDto = new UpdateStatusRequestDto(AppointmentStatus.CONFIRMEE);
        AppointmentResponseDto result = appointmentService.updateStatus(1L, updateDto);

        assertNotNull(result);
        assertEquals(AppointmentStatus.CONFIRMEE, sampleRequest.getStatus());
        verify(repository, times(1)).save(sampleRequest);
    }

    @Test
    @DisplayName("Devrait calculer correctement les statistiques du tableau de bord")
    void shouldCalculateDashboardStats() {
        when(repository.count()).thenReturn(10L);
        when(repository.countByStatus(AppointmentStatus.EN_ATTENTE)).thenReturn(4L);
        when(repository.countByStatus(AppointmentStatus.CONFIRMEE)).thenReturn(5L);
        when(repository.countByStatus(AppointmentStatus.REFUSEE)).thenReturn(1L);

        DashboardStatsDto stats = appointmentService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotal());
        assertEquals(4L, stats.getEnAttente());
        assertEquals(5L, stats.getConfirmees());
        assertEquals(1L, stats.getRefusees());
    }

    @Test
    @DisplayName("Devrait renvoyer 7 jours d'évolution avec les jours vides à zéro")
    void shouldReturnDailyStatsForSevenDays() {
        AppointmentRequest todayRequest = new AppointmentRequest("Amina", "0611111111", null);
        todayRequest.setCreatedAt(LocalDateTime.now());
        AppointmentRequest yesterdayRequest = new AppointmentRequest("Sara", "0622222222", null);
        yesterdayRequest.setCreatedAt(LocalDateTime.now().minusDays(1));

        when(repository.findByCreatedAtAfterOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of(yesterdayRequest, todayRequest));

        List<DailyStatsDto> result = appointmentService.getDailyStats(7);

        assertEquals(7, result.size());
        LocalDate today = LocalDate.now();
        assertEquals(today, result.get(6).getDate());
        assertEquals(1L, result.get(6).getCount());
        assertEquals(today.minusDays(1), result.get(5).getDate());
        assertEquals(1L, result.get(5).getCount());
        assertEquals(0L, result.get(0).getCount());
    }

    @Test
    @DisplayName("Devrait borner le nombre de jours entre 1 et 90")
    void shouldClampDailyStatsRange() {
        when(repository.findByCreatedAtAfterOrderByCreatedAtAsc(any(LocalDateTime.class)))
                .thenReturn(List.of());

        assertEquals(1, appointmentService.getDailyStats(0).size());
        assertEquals(90, appointmentService.getDailyStats(500).size());
    }

    @Test
    @DisplayName("Devrait nettoyer la recherche avant interrogation du repository")
    void shouldTrimSearchTerm() {
        when(repository.search(any(), eq("Fatima"), any(Pageable.class)))
                .thenReturn(Page.empty());

        appointmentService.getAllAppointments(null, "  Fatima  ", PageRequest.of(0, 10));

        verify(repository).search(null, "Fatima", PageRequest.of(0, 10));
    }
}
