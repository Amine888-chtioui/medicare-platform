package com.medicare.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.platform.dto.response.PatientResponseDto;
import com.medicare.platform.entity.Patient;
import com.medicare.platform.exception.GlobalExceptionHandler;
import com.medicare.platform.exception.ResourceNotFoundException;
import com.medicare.platform.service.PatientService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminPatientControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PatientService patientService;

    @InjectMocks
    private AdminPatientController controller;

    private PatientResponseDto sampleDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleDto = new PatientResponseDto();
        sampleDto.setId(1L);
        sampleDto.setFullName("Sara Alami");
        sampleDto.setPhoneNumber("0612345678");
        sampleDto.setNotes("Notes confidentielles");
        sampleDto.setTotalAppointments(2);
        sampleDto.setConfirmedAppointments(2);
        sampleDto.setLatestStatus("CONFIRMEE");
        sampleDto.setHistory(List.of());
    }

    @Test
    @DisplayName("GET /api/admin/patients - Liste des dossiers patients")
    void getAllPatients() throws Exception {
        when(patientService.getAllPatients("Sara")).thenReturn(List.of(sampleDto));

        mockMvc.perform(get("/api/admin/patients").param("search", "Sara"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Sara Alami"))
                .andExpect(jsonPath("$[0].phoneNumber").value("0612345678"));
    }

    @Test
    @DisplayName("GET /api/admin/patients/{id} - Détail du dossier patient")
    void getPatientById() throws Exception {
        when(patientService.getPatientById(1L)).thenReturn(sampleDto);

        mockMvc.perform(get("/api/admin/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Sara Alami"));
    }

    @Test
    @DisplayName("GET /api/admin/patients/{id} - 404 si introuvable")
    void getPatientByIdNotFound() throws Exception {
        when(patientService.getPatientById(999L))
                .thenThrow(new ResourceNotFoundException("Dossier patient introuvable"));

        mockMvc.perform(get("/api/admin/patients/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/admin/patients/{id}/notes - Enregistrement des notes médicales")
    void updateNotes() throws Exception {
        when(patientService.updateNotes(eq(1L), eq("Nouvelle observation"))).thenReturn(sampleDto);

        mockMvc.perform(put("/api/admin/patients/1/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("notes", "Nouvelle observation"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/admin/patients - Création d'un dossier patient avec succès")
    void createPatient() throws Exception {
        Patient patient = new Patient("Sara Alami", "0612345678");
        patient.setId(1L);
        when(patientService.getOrCreatePatient("Sara Alami", "0612345678")).thenReturn(patient);

        mockMvc.perform(post("/api/admin/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Sara Alami",
                                "phoneNumber", "0612345678"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Sara Alami"));
    }
}
