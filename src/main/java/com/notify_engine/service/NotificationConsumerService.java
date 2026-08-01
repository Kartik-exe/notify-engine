package com.notify_engine.service;

import com.notify_engine.model.NotificationRequest;
import com.notify_engine.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumerService {

    private final NotificationRepository repository;
    private final EmailService emailService;

    // Retries 3 times with non-blocking exponential backoff before sending to DLT
    @RetryableTopic(attempts = "3", backoff = @Backoff(delay = 2000, multiplier = 2.0), dltTopicSuffix = ".dlt")
    @KafkaListener(topics = "notifications.ingest", groupId = "notification-workers")
    public void consume(NotificationRequest event) {
        log.info("Processing notification for recipient: {}", event.getRecipient());

        try {
            // 1. Dispatch Email
            if ("EMAIL".equalsIgnoreCase(event.getChannel())) {
                emailService.sendEmail(event);
            }

            // 2. Update DB Status to DELIVERED only if dispatch succeeds
            repository.findByIdempotencyKey(event.getIdempotencyKey()).ifPresent(entity -> {
                entity.setStatus("DELIVERED");
                repository.save(entity);
            });

        } catch (Exception e) {
            log.error("Failed to process notification for {}. Triggering retry...", event.getRecipient(), e);

            // Increment retry count in DB
            repository.findByIdempotencyKey(event.getIdempotencyKey()).ifPresent(entity -> {
                entity.setRetryCount((entity.getRetryCount() == null ? 0 : entity.getRetryCount()) + 1);
                entity.setStatus("FAILED");
                repository.save(entity);
            });

            // Re-throw exception so @RetryableTopic catches it and retries!
            throw e;
        }
    }

    private void sendEmail(NotificationRequest request) {
        // Simulate random temporary failures to trigger Kafka Retry
        if (request.getContent().contains("FAIL")) {
            log.error("Provider failed to dispatch email. Retrying...");
            throw new RuntimeException("Third-party Email API timeout!");
        }
        log.info("Email successfully sent to {}", request.getRecipient());
    }

    @DltHandler
    public void handleDlt(NotificationRequest event) {
        log.error("Notification permanently failed after retries. Moving to DLT: {}", event.getIdempotencyKey());
        repository.findByIdempotencyKey(event.getIdempotencyKey()).ifPresent(entity -> {
            entity.setStatus("FAILED");
            repository.save(entity);
        });
    }
}