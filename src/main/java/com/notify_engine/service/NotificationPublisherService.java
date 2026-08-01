package com.notify_engine.service;

import com.notify_engine.entity.NotificationEntity;
import com.notify_engine.model.NotificationRequest;
import com.notify_engine.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisherService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final NotificationRepository notificationRepository;

    private static final String TOPIC = "notifications.ingest";

    @Transactional
    public NotificationEntity queueNotification(NotificationRequest req) {
        // Idempotency Check
        return notificationRepository.findByIdempotencyKey(req.getIdempotencyKey())
                .orElseGet(() -> {
                    NotificationEntity entity = NotificationEntity.builder()
                            .sid(UUID.randomUUID().toString())
                            .idempotencyKey(req.getIdempotencyKey())
                            .recipient(req.getRecipient())
                            .channel(req.getChannel().toUpperCase())
                            .subject(req.getSubject())
                            .content(req.getContent())
                            .status("PENDING")
                            .retryCount(0)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    notificationRepository.save(entity);

                    // Publish to Kafka
                    kafkaTemplate.send(TOPIC, entity.getSid(), req);
                    log.info("Notification event published to Kafka. ID: {}", entity.getSid());
                    return entity;
                });
    }
}
