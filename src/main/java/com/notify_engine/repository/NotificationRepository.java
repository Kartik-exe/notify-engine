package com.notify_engine.repository;

import com.notify_engine.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {

    /**
     * Used for Idempotency Check to prevent processing duplicate requests.
     */
    Optional<NotificationEntity> findByIdempotencyKey(String idempotencyKey);
}