package com.medicare.platform;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.platform.entity.Admin;
import com.medicare.platform.repository.AdminRepository;
import com.medicare.platform.repository.AppointmentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRequestRepository appointmentRequestRepository;

    @Autowired
    private com.medicare.platform.repository.AdminNotificationRepository adminNotificationRepository;

    @Autowired
    private com.medicare.platform.repository.PatientRepository patientRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        adminNotificationRepository.deleteAll();
        appointmentRequestRepository.deleteAll();
        patientRepository.deleteAll();
        // Ensure the test admin account exists (replaces AdminDataInitializer)
        if (!adminRepository.existsByUsername("testadmin")) {
            Admin testAdmin = new Admin();
            testAdmin.setUsername("testadmin");
            testAdmin.setEmail("test@medicare.local");
            testAdmin.setPassword(passwordEncoder.encode("Test1234!"));
            adminRepository.save(testAdmin);
        }
    }

    @Test
    @DisplayName("Une demande publique valide est enregistrée avec le statut EN_ATTENTE")
    void publicRequestIsPersisted() throws Exception {
        String body = """
                {
                  "fullName": "Salma Bennani",
                  "phoneNumber": "0612345678",
                  "description": "Première consultation"
                }
                """;

        mockMvc.perform(post("/api/public/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Salma Bennani"))
                .andExpect(jsonPath("$.data.status").value("EN_ATTENTE"));

        org.junit.jupiter.api.Assertions.assertEquals(1, appointmentRequestRepository.count());
    }

    @Test
    @DisplayName("Un numéro de téléphone invalide est refusé en 400")
    void publicRequestRejectsInvalidPhone() throws Exception {
        String body = """
                {
                  "fullName": "Salma Bennani",
                  "phoneNumber": "123",
                  "description": "Test"
                }
                """;

        mockMvc.perform(post("/api/public/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.phoneNumber").exists());

        org.junit.jupiter.api.Assertions.assertEquals(0, appointmentRequestRepository.count());
    }

    @Test
    @DisplayName("Les endpoints admin sont protégés sans JWT")
    void adminEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/appointment-requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("La connexion refuse un mauvais mot de passe")
    void loginRejectsWrongPassword() throws Exception {
        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testadmin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Parcours admin complet : login, liste, détail, changement de statut, statistiques")
    void fullAdminFlow() throws Exception {
        // 1. Création publique
        String publicBody = """
                {
                  "fullName": "Nadia El Idrissi",
                  "phoneNumber": "+212612345678",
                  "description": "Suivi de grossesse"
                }
                """;
        MvcResult created = mockMvc.perform(post("/api/public/appointment-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(publicBody))
                .andExpect(status().isCreated())
                .andReturn();
        long requestId = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Connexion
        String token = login();

        // 3. Liste paginée + recherche
        mockMvc.perform(get("/api/admin/appointment-requests")
                        .param("search", "Nadia")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].fullName").value("Nadia El Idrissi"))
                .andExpect(jsonPath("$.totalElements").value(1));

        // 4. Détail
        mockMvc.perform(get("/api/admin/appointment-requests/" + requestId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(requestId));

        // 5. Changement de statut
        mockMvc.perform(patch("/api/admin/appointment-requests/" + requestId + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMEE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMEE"));

        // 6. Statistiques
        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.confirmees").value(1))
                .andExpect(jsonPath("$.enAttente").value(0));

        // 7. Évolution journalière
        mockMvc.perform(get("/api/admin/dashboard/daily-stats")
                        .param("days", "7")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(7)))
                .andExpect(jsonPath("$[6].count").value(1));
    }

    @Test
    @DisplayName("Un filtre de statut invalide renvoie 400, pas 500")
    void invalidStatusFilterReturnsBadRequest() throws Exception {
        String token = login();

        mockMvc.perform(get("/api/admin/appointment-requests")
                        .param("status", "INCONNU")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Une demande inexistante renvoie 404")
    void missingRequestReturnsNotFound() throws Exception {
        String token = login();

        mockMvc.perform(get("/api/admin/appointment-requests/999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    private String login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testadmin\",\"password\":\"Test1234!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.path("data").path("token").asText();
    }
}
