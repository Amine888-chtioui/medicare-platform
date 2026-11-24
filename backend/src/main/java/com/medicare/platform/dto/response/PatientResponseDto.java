package com.medicare.platform.dto.response;

import com.medicare.platform.entity.AppointmentRequest;
import com.medicare.platform.entity.AppointmentStatus;
import com.medicare.platform.entity.Patient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PatientResponseDto {

    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String notes;
    private int totalAppointments;
    private int confirmedAppointments;
    private String lastVisit;
    private String latestStatus;
    private LocalDateTime createdAt;
    private List<AppointmentResponseDto> history = new ArrayList<>();

    public PatientResponseDto() {
    }

    public static PatientResponseDto fromEntity(Patient entity) {
        PatientResponseDto dto = new PatientResponseDto();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setEmail(entity.getEmail());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());

        List<AppointmentRequest> appointments = entity.getAppointments();
        if (appointments != null && !appointments.isEmpty()) {
            dto.setTotalAppointments(appointments.size());
            int confirmed = 0;
            String lastVisitStr = null;
            AppointmentStatus latest = null;

            List<AppointmentResponseDto> historyList = new ArrayList<>();
            for (AppointmentRequest req : appointments) {
                if (req.getStatus() == AppointmentStatus.CONFIRMEE) {
                    confirmed++;
                }
                if (lastVisitStr == null) {
                    if (req.getAppointmentDate() != null) {
                        lastVisitStr = req.getAppointmentDate().toString();
                    } else if (req.getCreatedAt() != null) {
                        lastVisitStr = req.getCreatedAt().toString();
                    }
                    latest = req.getStatus();
                }
                historyList.add(AppointmentResponseDto.fromEntity(req));
            }
            dto.setConfirmedAppointments(confirmed);
            dto.setLastVisit(lastVisitStr);
            dto.setLatestStatus(latest != null ? latest.name() : "CONFIRMEE");
            dto.setHistory(historyList);
        } else {
            dto.setTotalAppointments(0);
            dto.setConfirmedAppointments(0);
            dto.setLatestStatus("CONFIRMEE");
            dto.setLastVisit(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        }

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(int totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public int getConfirmedAppointments() {
        return confirmedAppointments;
    }

    public void setConfirmedAppointments(int confirmedAppointments) {
        this.confirmedAppointments = confirmedAppointments;
    }

    public String getLastVisit() {
        return lastVisit;
    }

    public void setLastVisit(String lastVisit) {
        this.lastVisit = lastVisit;
    }

    public String getLatestStatus() {
        return latestStatus;
    }

    public void setLatestStatus(String latestStatus) {
        this.latestStatus = latestStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<AppointmentResponseDto> getHistory() {
        return history;
    }

    public void setHistory(List<AppointmentResponseDto> history) {
        this.history = history;
    }
}
