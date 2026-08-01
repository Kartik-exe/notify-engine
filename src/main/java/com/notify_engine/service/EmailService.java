package com.notify_engine.service;

import com.notify_engine.model.NotificationRequest;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(NotificationRequest event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // 1. Set your freshly verified alias + display name
            helper.setFrom("kartik.nigam17+noreply@gmail.com", "No-Reply | Notify Engine");

            // 2. Target email from Kafka event (Make sure this is a real address!)
            helper.setTo(event.getRecipient());

            // 3. Email details
            helper.setSubject(event.getSubject());
            helper.setText(event.getContent(), false); // 'true' for HTML content

            mailSender.send(message);
            log.info("Email successfully sent via No-Reply alias to {}", event.getRecipient());

        } catch (Exception e) {
            log.error("Failed to send email to {}", event.getRecipient(), e);
            throw new RuntimeException("Email delivery failed", e);
        }
    }
}