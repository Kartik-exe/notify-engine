package com.notify_engine.controller;

import com.notify_engine.entity.NotificationEntity;
import com.notify_engine.model.NotificationRequest;
import com.notify_engine.repository.NotificationRepository;
import com.notify_engine.service.NotificationPublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows React UI calls
public class NotificationController {

    private final NotificationPublisherService publisherService;
    private final NotificationRepository repository;

    @PostMapping("/dispatch")
    public ResponseEntity<NotificationEntity> dispatch(@RequestBody NotificationRequest request) {
        NotificationEntity entity = publisherService.queueNotification(request);
        return ResponseEntity.ok(entity);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<NotificationEntity>> getLogs() {
        return ResponseEntity.ok(repository.findAll());
    }
}