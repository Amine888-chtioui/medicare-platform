package com.medicare.platform.controller;

import com.medicare.platform.dto.response.ApiResponse;
import com.medicare.platform.dto.response.PatientResponseDto;
import com.medicare.platform.entity.Patient;
import com.medicare.platform.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/patients")
public class AdminPatientController {

    private final PatientService patientService;

    public AdminPatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    /**
     * Liste tous les dossiers patients confirmés.
     */
    @GetMapping
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(patientService.getAllPatients(search));
    }

    /**
     * Récupère un dossier patient par son identifiant.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> getPatientById(@PathVariable Long id) {
        PatientResponseDto dto = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success("Dossier patient récupéré", dto));
    }

    /**
     * Met à jour les observations médicales / notes d'un patient.
     */
    @PutMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<PatientResponseDto>> updateNotes(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String notes = (body != null && body.get("notes") != null) ? body.get("notes") : "";
        PatientResponseDto updated = patientService.updateNotes(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Observations enregistrées avec succès", updated));
    }

    /**
     * Crée manuellement un nouveau dossier patient.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponseDto>> createPatient(
            @RequestBody Map<String, String> body
    ) {
        if (body == null || body.get("phoneNumber") == null || body.get("phoneNumber").isBlank()) {
            throw new IllegalArgumentException("Le numéro de téléphone est obligatoire");
        }
        String fullName = body.getOrDefault("fullName", "").trim();
        String phoneNumber = body.get("phoneNumber").trim();
        Patient patient = patientService.getOrCreatePatient(fullName, phoneNumber);
        PatientResponseDto responseDto = PatientResponseDto.fromEntity(patient);
        if (body.get("notes") != null && !body.get("notes").isBlank()) {
            responseDto = patientService.updateNotes(patient.getId(), body.get("notes"));
        }
        return ResponseEntity.ok(ApiResponse.success("Dossier patient créé avec succès", responseDto));
    }
}
