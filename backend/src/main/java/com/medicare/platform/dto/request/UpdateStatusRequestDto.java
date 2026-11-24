package com.medicare.platform.dto.request;

import com.medicare.platform.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UpdateStatusRequestDto {

    @NotNull(message = "Le statut est obligatoire")
    private AppointmentStatus status;

    private LocalDate appointmentDate;

    private String startTime;

    private String endTime;

    public UpdateStatusRequestDto() {
    }

    public UpdateStatusRequestDto(AppointmentStatus status) {
        this.status = status;
    }

    public UpdateStatusRequestDto(AppointmentStatus status, LocalDate appointmentDate, String startTime, String endTime) {
        this.status = status;
        this.appointmentDate = appointmentDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
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
}
