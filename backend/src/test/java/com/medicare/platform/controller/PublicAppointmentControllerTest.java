package com.medicare.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.medicare.platform.dto.request.CreateAppointmentRequestDto;
import com.medicare.platform.dto.response.AppointmentResponseDto;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.exception.GlobalExceptionHandler;
import com.medicare.platform.exception.RateLimitExceededException;
import com.medicare.platform.security.ClientIpResolver;
import com.medicare.platform.security.PublicRequestRateLimiter;
import com.medicare.platform.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PublicAppointmentControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private PublicRequestRateLimiter rateLimiter;

    @Mock
    private ClientIpResolver clientIpResolver;

    @InjectMocks
    private PublicAppointmentController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/public/appointment-requests - Succès 201 avec données valides")
    void createAppointmentSuccess() throws Exception {
        CreateAppointmentRequestDto dto = new CreateAppointmentRequestDto("Salma Tazi", "0612345678", "Consultation prénatale");
        dto.setAppointmentDate(LocalDate.of(2026, 11, 30));
        dto.setStartTime("10:00");

        AppointmentResponseDto responseDto = new AppointmentResponseDto();
        responseDto.setId(1L);
        responseDto.setFullName("Salma Tazi");
        responseDto.setPhoneNumber("0612345678");
        responseDto.setDescription("Consultation prénatale");
        responseDto.setAppointmentDate(LocalDate.of(2026, 11, 30));
        responseDto.setStartTime("10:00");
        responseDto.setEndTime("10:30");
        responseDto.setServiceType("Consultation");
        responseDto.setStatus(AppointmentStatus.EN_ATTENTE);

        when(clientIpResolver.resolve(any())).thenReturn("127.0.0.1");
        doNothing().when(rateLimiter).checkAllowed("127.0.0.1");
        when(appointmentService.createAppointment(any())).thenReturn(responseDto);
        doNothing().when(rateLimiter).recordRequest("127.0.0.1");

        mockMvc.perform(post("/api/public/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Salma Tazi"))
                .andExpect(jsonPath("$.data.status").value("EN_ATTENTE"));

        verify(rateLimiter).checkAllowed("127.0.0.1");
        verify(rateLimiter).recordRequest("127.0.0.1");
    }

    @Test
    @DisplayName("POST /api/public/appointment-requests - 429 Too Many Requests si rate limit dépassé")
    void createAppointmentRateLimited() throws Exception {
        CreateAppointmentRequestDto dto = new CreateAppointmentRequestDto("Salma Tazi", "0612345678", "Consultation");

        when(clientIpResolver.resolve(any())).thenReturn("192.168.1.100");
        doThrow(new RateLimitExceededException("Trop de demandes", 60))
                .when(rateLimiter).checkAllowed("192.168.1.100");

        mockMvc.perform(post("/api/public/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false));

        verify(appointmentService, never()).createAppointment(any());
    }

    @Test
    @DisplayName("POST /api/public/appointment-requests - 400 Bad Request pour numéro invalide")
    void createAppointmentInvalidPhone() throws Exception {
        CreateAppointmentRequestDto dto = new CreateAppointmentRequestDto("Salma Tazi", "0123456789", "Consultation");

        mockMvc.perform(post("/api/public/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.phoneNumber").exists());
    }
}
