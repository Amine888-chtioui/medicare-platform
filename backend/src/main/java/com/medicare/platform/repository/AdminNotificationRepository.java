package com.medicare.platform.repository;

import com.medicare.platform.entity.AdminNotification;
import com.medicare.platform.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {

    /**
     * Active notifications: not dismissed, linked appointment status still EN_ATTENTE.
     */
    @Query("SELECT n FROM AdminNotification n " +
           "WHERE n.dismissed = false " +
           "AND n.appointmentRequest.status = :status " +
           "ORDER BY n.createdAt DESC")
    List<AdminNotification> findActiveNotifications(@Param("status") AppointmentStatus status);

    /**
     * Count active notifications.
     */
    @Query("SELECT COUNT(n) FROM AdminNotification n " +
           "WHERE n.dismissed = false " +
           "AND n.appointmentRequest.status = :status")
    long countActiveNotifications(@Param("status") AppointmentStatus status);

    Optional<AdminNotification> findByAppointmentRequestId(Long appointmentRequestId);

    boolean existsByAppointmentRequestId(Long appointmentRequestId);

    /**
     * Soft-dismiss all notifications currently marked as active.
     */
    @Modifying
    @Query("UPDATE AdminNotification n SET n.dismissed = true, n.dismissedAt = CURRENT_TIMESTAMP WHERE n.dismissed = false")
    int dismissAllActive();
}
