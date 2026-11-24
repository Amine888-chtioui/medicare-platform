package com.medicare.platform.controller;

import com.medicare.platform.dto.response.AdminNotificationDto;
import com.medicare.platform.exception.GlobalExceptionHandler;
import com.medicare.platform.service.AdminNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminNotificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AdminNotificationService notificationService;

    @InjectMocks
    private AdminNotificationController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/notifications - Liste des notifications actives")
    void getActiveNotifications() throws Exception {
        AdminNotificationDto notif = new AdminNotificationDto(
                1L, 10L, "Nouvelle patiente", "0612345678",
                "Nouvelle demande", null, null, null,
                "Consultation", null, LocalDateTime.now(), false
        );
        when(notificationService.getActiveNotifications()).thenReturn(List.of(notif));

        mockMvc.perform(get("/api/admin/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].appointmentRequestId").value(10));
    }

    @Test
    @DisplayName("GET /api/admin/notifications/count - Nombre de notifications non lues")
    void getActiveCount() throws Exception {
        when(notificationService.getActiveCount()).thenReturn(3L);

        mockMvc.perform(get("/api/admin/notifications/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));
    }

    @Test
    @DisplayName("DELETE /api/admin/notifications/{id} - Suppression individuelle")
    void dismissNotification() throws Exception {
        when(notificationService.dismissNotification(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/admin/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/admin/notifications - Suppression globale")
    void dismissAll() throws Exception {
        when(notificationService.dismissAll()).thenReturn(4);

        mockMvc.perform(delete("/api/admin/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dismissedCount").value(4));
    }
}
