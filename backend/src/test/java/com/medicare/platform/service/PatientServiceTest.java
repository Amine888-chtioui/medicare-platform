package com.medicare.platform.service;

import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.entity.Patient;
import com.medicare.platform.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        samplePatient = new Patient("Fatima Zahra", "0612345678");
        samplePatient.setId(1L);
    }

    @Test
    @DisplayName("getOrCreatePatient crée un nouveau patient s'il n'existe pas")
    void createsNewPatientIfNotExists() {
        when(patientRepository.findByPhoneNumber("0612345678")).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> {
            Patient p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });

        Patient result = patientService.getOrCreatePatient("Fatima Zahra", "0612345678");

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Fatima Zahra", result.getFullName());
        assertEquals("0612345678", result.getPhoneNumber());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    @DisplayName("getOrCreatePatient réutilise le patient existant sans doublon (idempotent)")
    void reusesExistingPatientWithoutDuplicates() {
        when(patientRepository.findByPhoneNumber("0612345678")).thenReturn(Optional.of(samplePatient));
        when(patientRepository.save(any(Patient.class))).thenReturn(samplePatient);

        Patient result1 = patientService.getOrCreatePatient("Fatima Zahra", "0612345678");
        Patient result2 = patientService.getOrCreatePatient("Fatima Zahra", "0612345678");

        assertNotNull(result1);
        assertNotNull(result2);
        assertEquals(1L, result1.getId());
        assertEquals(1L, result2.getId());
    }

    @Test
    @DisplayName("getOrCreatePatient échoue si le téléphone est vide")
    void failsWhenPhoneIsEmpty() {
        assertThrows(IllegalArgumentException.class, () ->
                patientService.getOrCreatePatient("Fatima", "   ")
        );
    }

    @Test
    @DisplayName("getAllPatients sans recherche utilise findAllWithAppointments")
    void getAllPatientsWithoutSearch() {
        when(patientRepository.findAllWithAppointments()).thenReturn(java.util.List.of(samplePatient));

        java.util.List<com.medicare.platform.dto.response.PatientResponseDto> list = patientService.getAllPatients(null);

        assertEquals(1, list.size());
        assertEquals("Fatima Zahra", list.get(0).getFullName());
        verify(patientRepository).findAllWithAppointments();
        verify(patientRepository, never()).searchWithAppointments(any());
    }

    @Test
    @DisplayName("getAllPatients avec recherche utilise searchWithAppointments")
    void getAllPatientsWithSearch() {
        when(patientRepository.searchWithAppointments("Fatima")).thenReturn(java.util.List.of(samplePatient));

        java.util.List<com.medicare.platform.dto.response.PatientResponseDto> list = patientService.getAllPatients("  Fatima  ");

        assertEquals(1, list.size());
        assertEquals("Fatima Zahra", list.get(0).getFullName());
        verify(patientRepository).searchWithAppointments("Fatima");
        verify(patientRepository, never()).findAllWithAppointments();
    }

    @Test
    @DisplayName("getPatientById trouve le patient ou lève une exception 404")
    void getPatientByIdFoundAndNotFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        com.medicare.platform.dto.response.PatientResponseDto found = patientService.getPatientById(1L);
        assertNotNull(found);
        assertEquals(1L, found.getId());

        assertThrows(com.medicare.platform.exception.ResourceNotFoundException.class,
                () -> patientService.getPatientById(999L));
    }

    @Test
    @DisplayName("updateNotes met à jour les observations confidentielles")
    void updateNotesSuccessfully() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        com.medicare.platform.dto.response.PatientResponseDto updated = patientService.updateNotes(1L, "Patiente suivie pour grossesse gémellaire");

        assertNotNull(updated);
        assertEquals("Patiente suivie pour grossesse gémellaire", updated.getNotes());
        verify(patientRepository).save(samplePatient);
    }
}
