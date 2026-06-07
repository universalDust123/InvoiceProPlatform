package com.microsaas.invoice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(nullable = false)
    private String tenantId;

    // Notification Preferences
    @Column(name = "notify_payment_reminders", nullable = false)
    @Builder.Default
    private Boolean notifyPaymentReminders = true;

    @Column(name = "notify_invoice_confirmations", nullable = false)
    @Builder.Default
    private Boolean notifyInvoiceConfirmations = true;

    @Column(name = "notify_weekly_reports", nullable = false)
    @Builder.Default
    private Boolean notifyWeeklyReports = true;

    @Column(name = "notify_security_alerts", nullable = false)
    @Builder.Default
    private Boolean notifySecurityAlerts = true;

    // User Preferences
    @Column(name = "theme_preference", nullable = false)
    @Builder.Default
    private String themePreference = "dark";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
