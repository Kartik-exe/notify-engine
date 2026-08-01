package com.notify_engine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity {

    @Id
    private String sid;

    @Column(nullable = false, unique = true)
    private String idempotencyKey;

    private String recipient;

    private String channel;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String status;

    private Integer retryCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.sid == null) {
            // Generates a random NanoID or UUID
            this.sid = java.util.UUID.randomUUID().toString();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}