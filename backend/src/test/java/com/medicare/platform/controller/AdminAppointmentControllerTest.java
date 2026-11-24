package com.medicare.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.medicare.platform.dto.request.CreateAppointmentRequestDto;
import com.medicare.platform.dto.request.UpdateStatusRequestDto;
import com.medicare.platform.dto.response.AppointmentResponseDto;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.exception.GlobalExceptionHandler;
import com.medicare.platform.exception.ResourceNotFoundException;
import com.medicare.platform.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminAppointmentControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private AppointmentService appointmentService;

    @InjectMocks
    private AdminAppointmentController controller;

    private AppointmentResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleResponse = new AppointmentResponseDto();
        sampleResponse.setId(5L);
        sampleResponse.setFullName("Khadija Mansouri");
        sampleResponse.setPhoneNumber("0661234567");
        sampleResponse.setDescription("Suivi grossesse");
        sampleResponse.setAppointmentDate(LocalDate.of(2026, 11, 28));
        sampleResponse.setStartTime("09:30");
        sampleResponse.setEndTime("10:00");
        sampleResponse.setServiceType("Échographie obstétricale");
        sampleResponse.setStatus(AppointmentStatus.CONFIRMEE);
    }

    @Test
    @DisplayName("GET /api/admin/appointment-requests/schedule - Renvoie les RDV confirmés de la période")
    void getSchedule() throws Exception {
        LocalDate start = LocalDate.of(2026, 11, 23);
        LocalDate end = LocalDate.of(2026, 11, 29);
        when(appointmentService.getSchedule(start, end)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/admin/appointment-requests/schedule")
                        .param("startDate", "2026-11-23")
                        .param("endDate", "2026-11-29"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Khadija Mansouri"))
                .andExpect(jsonPath("$[0].startTime").value("09:30"));
    }

    @Test
    @DisplayName("GET /api/admin/appointment-requests/check-conflict - Détecte les conflits de créneau")
    void checkConflict() throws Exception {
        LocalDate date = LocalDate.of(2026, 11, 28);
        when(appointmentService.checkConflict(date, "09:30", null)).thenReturn(true);

        mockMvc.perform(get("/api/admin/appointment-requests/check-conflict")
                        .param("date", "2026-11-28")
                        .param("startTime", "09:30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conflict").value(true));
    }

    @Test
    @DisplayName("POST /api/admin/appointment-requests - Crée un RDV direct côté admin")
    void createAdminAppointment() throws Exception {
        CreateAppointmentRequestDto dto = new CreateAppointmentRequestDto("Khadija Mansouri", "0661234567", "Suivi");
        dto.setAppointmentDate(LocalDate.of(2026, 11, 28));
        dto.setStartTime("09:30");

        when(appointmentService.createAdminAppointment(any())).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/admin/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(5));
    }

    @Test
    @DisplayName("GET /api/admin/appointment-requests - Liste paginée avec filtres")
    void getAllAppointments() throws Exception {
        when(appointmentService.getAllAppointments(eq(AppointmentStatus.CONFIRMEE), eq("Khadija"), any()))
                .thenReturn(new PageImpl<>(List.of(sampleResponse), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/admin/appointment-requests")
                        .param("status", "CONFIRMEE")
                        .param("search", "Khadija")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("Khadija Mansouri"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/admin/appointment-requests/{id} - 404 si demande introuvable")
    void getByIdNotFound() throws Exception {
        when(appointmentService.getAppointmentById(999L))
                .thenThrow(new ResourceNotFoundException("Demande de rendez-vous introuvable avec l'ID : 999"));

        mockMvc.perform(get("/api/admin/appointment-requests/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /api/admin/appointment-requests/{id}/status - Met à jour le statut")
    void updateStatus() throws Exception {
        UpdateStatusRequestDto dto = new UpdateStatusRequestDto(AppointmentStatus.CONFIRMEE);
        when(appointmentService.updateStatus(eq(5L), any())).thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/admin/appointment-requests/5/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CONFIRMEE"));
    }
}
