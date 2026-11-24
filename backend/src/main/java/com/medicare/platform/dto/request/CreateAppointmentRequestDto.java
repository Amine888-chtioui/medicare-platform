package com.medicare.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateAppointmentRequestDto {

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit comporter entre 2 et 100 caractères")
    private String fullName;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(
        regexp = "^(?:(?:\\+|00)212|0)[5-7]\\d{8}$",
        message = "Format de numéro de téléphone invalide (ex: 06XXXXXXXX ou +2126XXXXXXXX)"
    )
    private String phoneNumber;

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    private java.time.LocalDate appointmentDate;

    private String startTime;

    private String endTime;

    private String serviceType;

    public CreateAppointmentRequestDto() {
    }

    public CreateAppointmentRequestDto(String fullName, String phoneNumber, String description) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.description = description;
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
}
