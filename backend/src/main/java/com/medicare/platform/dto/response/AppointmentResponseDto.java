package com.medicare.platform.dto.response;

import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import java.time.LocalDateTime;

public class AppointmentResponseDto {

    private Long id;
    private String fullName;
    private String phoneNumber;
    private String description;
    private AppointmentStatus status;
    private java.time.LocalDate appointmentDate;
    private String startTime;
    private String endTime;
    private String serviceType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AppointmentResponseDto() {
    }

    public static AppointmentResponseDto fromEntity(AppointmentRequest entity) {
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setAppointmentDate(entity.getAppointmentDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setServiceType(entity.getServiceType());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public java.time.LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(java.time.LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
