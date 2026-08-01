package com.notify_engine.model;

import lombok.Data;

@Data
public class NotificationRequest {

    private String idempotencyKey;
    private String recipient;
    private String channel; // EMAIL, WEBSOCKET
    private String subject;
    private String content;

}