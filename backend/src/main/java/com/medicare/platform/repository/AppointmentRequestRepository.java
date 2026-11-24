package com.medicare.platform.repository;

import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRequestRepository extends JpaRepository<AppointmentRequest, Long> {

    long countByStatus(AppointmentStatus status);

    List<AppointmentRequest> findByStatus(AppointmentStatus status);

    List<AppointmentRequest> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime start);

    List<AppointmentRequest> findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscStartTimeAsc(java.time.LocalDate startDate, java.time.LocalDate endDate, AppointmentStatus status);

    boolean existsByAppointmentDateAndStartTimeAndStatus(java.time.LocalDate appointmentDate, String startTime, AppointmentStatus status);

    @Query("SELECT COUNT(a) > 0 FROM AppointmentRequest a WHERE a.appointmentDate = :date AND a.startTime = :startTime AND a.status = com.medicare.platform.entity.AppointmentStatus.CONFIRMEE AND (:excludeId IS NULL OR a.id != :excludeId)")
    boolean existsConflict(
            @Param("date") java.time.LocalDate date,
            @Param("startTime") String startTime,
            @Param("excludeId") Long excludeId
    );

    @Query("SELECT a FROM AppointmentRequest a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR a.phoneNumber LIKE CONCAT('%', :search, '%'))")
    Page<AppointmentRequest> search(
            @Param("status") AppointmentStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
