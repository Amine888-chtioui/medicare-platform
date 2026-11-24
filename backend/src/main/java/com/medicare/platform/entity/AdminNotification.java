package com.medicare.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "admin_notifications",
    indexes = {
        @Index(name = "idx_admin_notif_dismissed", columnList = "dismissed"),
        @Index(name = "idx_admin_notif_created_at", columnList = "created_at")
    }
)
public class AdminNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_request_id", nullable = false, unique = true)
    private AppointmentRequest appointmentRequest;

    @Column(name = "dismissed", nullable = false)
    private boolean dismissed = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "dismissed_at")
    private LocalDateTime dismissedAt;

    public AdminNotification() {
    }

    public AdminNotification(AppointmentRequest appointmentRequest) {
        this.appointmentRequest = appointmentRequest;
        this.dismissed = false;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AppointmentRequest getAppointmentRequest() {
        return appointmentRequest;
    }

    public void setAppointmentRequest(AppointmentRequest appointmentRequest) {
        this.appointmentRequest = appointmentRequest;
    }

    public boolean isDismissed() {
        return dismissed;
    }

    public void setDismissed(boolean dismissed) {
        this.dismissed = dismissed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getDismissedAt() {
        return dismissedAt;
    }

    public void setDismissedAt(LocalDateTime dismissedAt) {
        this.dismissedAt = dismissedAt;
    }
}
