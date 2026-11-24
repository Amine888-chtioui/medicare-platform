package com.medicare.platform.service;

import com.medicare.platform.dto.response.PatientResponseDto;
import com.medicare.platform.entity.Patient;
import com.medicare.platform.exception.ResourceNotFoundException;
import com.medicare.platform.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PatientService {

    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Recherche un patient existant par son numéro de téléphone ou en crée un nouveau.
     * Cette méthode est strictement idempotente : plusieurs appels pour un même patient
     * ne créeront jamais de doublon.
     */
    public Patient getOrCreatePatient(String fullName, String phoneNumber) {
        String cleanPhone = phoneNumber != null ? phoneNumber.trim() : "";
        String cleanName = fullName != null ? fullName.trim() : "";

        if (cleanPhone.isEmpty()) {
            throw new IllegalArgumentException("Le numéro de téléphone du patient est requis pour créer un dossier");
        }

        Optional<Patient> existingOpt = patientRepository.findByPhoneNumber(cleanPhone);
        if (existingOpt.isPresent()) {
            Patient existing = existingOpt.get();
            // Met à jour le nom complet si le nouveau nom est plus long/complet
            if (cleanName.length() > existing.getFullName().length()) {
                existing.setFullName(cleanName);
            }
            existing.setUpdatedAt(LocalDateTime.now());
            logger.info("Found existing patient ID {}", existing.getId());
            return patientRepository.save(existing);
        }

        Patient newPatient = new Patient(cleanName, cleanPhone);
        Patient saved = patientRepository.save(newPatient);
        logger.info("Created new patient folder ID {}", saved.getId());
        return saved;
    }

    /**
     * Récupère la liste de tous les dossiers patients avec leurs rendez-vous.
     */
    @Transactional(readOnly = true)
    public List<PatientResponseDto> getAllPatients(String search) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<Patient> patients = (cleanSearch != null)
                ? patientRepository.searchWithAppointments(cleanSearch)
                : patientRepository.findAllWithAppointments();

        return patients.stream()
                .map(PatientResponseDto::fromEntity)
                .toList();
    }

    /**
     * Récupère un dossier patient par son identifiant unique.
     */
    @Transactional(readOnly = true)
    public PatientResponseDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier patient introuvable avec l'ID : " + id));
        return PatientResponseDto.fromEntity(patient);
    }

    /**
     * Met à jour les observations médicales / notes praticien du dossier patient.
     */
    public PatientResponseDto updateNotes(Long id, String notes) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier patient introuvable avec l'ID : " + id));
        patient.setNotes(notes);
        patient.setUpdatedAt(LocalDateTime.now());
        Patient saved = patientRepository.save(patient);
        return PatientResponseDto.fromEntity(saved);
    }
}
