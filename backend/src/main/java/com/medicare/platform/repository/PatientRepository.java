package com.medicare.platform.repository;

import com.medicare.platform.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT p FROM Patient p WHERE " +
           "(:search IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR p.phoneNumber LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY p.updatedAt DESC")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Patient p LEFT JOIN FETCH p.appointments a ORDER BY p.updatedAt DESC")
    List<Patient> findAllWithAppointments();

    @Query("SELECT DISTINCT p FROM Patient p LEFT JOIN FETCH p.appointments a WHERE " +
           "(:search IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR p.phoneNumber LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY p.updatedAt DESC")
    List<Patient> searchWithAppointments(@Param("search") String search);
}
