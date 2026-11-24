package com.medicare.platform.dto.response;

import com.medicare.platform.entity.AdminNotification;
import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminNotificationDto(
    Long id,
    Long appointmentRequestId,
    String fullName,
    String phoneNumber,
    String description,
    LocalDate appointmentDate,
    String startTime,
    String endTime,
    String serviceType,
    AppointmentStatus status,
    LocalDateTime createdAt,
    boolean dismissed
) {
    public static AdminNotificationDto fromEntity(AdminNotification notification) {
        AppointmentRequest req = notification.getAppointmentRequest();
        return new AdminNotificationDto(
            notification.getId(),
            req != null ? req.getId() : null,
            req != null ? req.getFullName() : "",
            req != null ? req.getPhoneNumber() : "",
            req != null ? req.getDescription() : null,
            req != null ? req.getAppointmentDate() : null,
            req != null ? req.getStartTime() : null,
            req != null ? req.getEndTime() : null,
            req != null ? req.getServiceType() : null,
            req != null ? req.getStatus() : null,
            notification.getCreatedAt(),
            notification.isDismissed()
        );
    }
}
