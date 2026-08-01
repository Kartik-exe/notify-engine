# 🚀 Event-Driven Notification Engine

![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)

A **production-ready, distributed, and resilient event-driven notification system** built using **Spring Boot**, **Apache Kafka**, **MariaDB**, and **Next.js**.

The platform enables client applications to trigger **asynchronous email notifications** through Kafka, persist delivery records, automatically retry transient failures, route failed events to a **Dead Letter Topic (DLT)**, and deliver branded **No-Reply** emails using Spring Mail and Gmail SMTP.

---

# ✨ Features

- 📩 Asynchronous email delivery using Apache Kafka
- 🔁 Automatic retry mechanism with exponential backoff
- ☠️ Dead Letter Topic (DLT) support for failed events
- 💾 Persistent notification tracking using MariaDB
- 📬 Professional No-Reply branded emails
- ⚡ Spring Kafka with `@RetryableTopic`
- 🌐 Next.js frontend to publish notification events
- 📊 Notification status tracking (PENDING, SENT, FAILED)
- 🧩 Production-ready layered architecture

---

# 🏗️ Architecture

```text
+------------------+         +----------------------------+         +--------------------------+
|                  |         |                            |         |                          |
|  Next.js Client  | ----->  |   Kafka Broker (KRaft)     | ----->  | Spring Boot Notification |
|                  |         | notifications.ingest       |         |        Service           |
+------------------+         +----------------------------+         +------------+-------------+
                                                                                 |
                                                                                 |
                                                                                 v
                                                               +--------------------------+
                                                               |       MariaDB            |
                                                               | Notification Persistence |
                                                               +------------+-------------+
                                                                            |
                                                                            |
                                                                            v
                                                               +--------------------------+
                                                               |      Gmail SMTP          |
                                                               |  No-Reply Email Sender   |
                                                               +------------+-------------+
                                                                            |
                                                                            |
                                                                            v
                                                               +--------------------------+
                                                               |     Recipient Inbox      |
                                                               +--------------------------+
```

---

# 🔄 Workflow

## 1. Event Ingestion

The Next.js frontend publishes a notification request to:

```
notifications.ingest
```

---

## 2. Kafka Consumption

Spring Boot consumes the event using:

```java
@KafkaListener
```

---

## 3. Retry Logic

If delivery fails due to a temporary issue:

- Retry #1
- Retry #2
- Retry #3

using

```java
@RetryableTopic
```

with exponential backoff.

---

## 4. Dead Letter Topic

If all retries fail, Kafka automatically moves the event to:

```
notifications.ingest-dlt
```

where it is handled separately.

---

## 5. Database Persistence

Every notification is stored inside MariaDB.

Possible states:

- PENDING
- SENT
- FAILED

---

## 6. Email Delivery

Spring Mail formats a MIME email and sends it through Gmail SMTP.

---

# 🛠 Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | Next.js 14, React |
| Backend | Spring Boot 3 |
| Messaging | Apache Kafka 3.x (KRaft) |
| Database | MariaDB |
| ORM | Spring Data JPA |
| Email | JavaMailSender |
| SMTP | Gmail SMTP |
| Build Tool | Maven |
| Boilerplate | Lombok |

---

# 📂 Project Structure

```
notification-engine/
│
├── backend/
│   ├── controller/
│   ├── consumer/
│   ├── producer/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   ├── config/
│   └── NotificationEngineApplication.java
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── pages/
│
└── README.md
```

---

# ⚙️ Configuration

## Database

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/notification_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
```

---

## Kafka

```properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=notification-engine-group
spring.kafka.consumer.auto-offset-reset=earliest
```

---

## Gmail SMTP

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587

spring.mail.username=kartik.nigam17@gmail.com
spring.mail.password=your_app_password

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

# 📧 No-Reply Email Alias

Configure Gmail:

1. Open Gmail Settings
2. Accounts and Import
3. Add another email address
4. Name

```
No-Reply | Notify Engine
```

5. Email

```
kartik.nigam17+noreply@gmail.com
```

Verify the alias and you're ready to send branded emails.

---

# 💻 Core Components

## Kafka Consumer

Responsible for

- Receiving Kafka events
- Saving initial notification
- Sending email
- Updating status

Uses:

```java
@KafkaListener
@RetryableTopic
@DltHandler
```

---

## Email Service

Uses

```java
JavaMailSender
MimeMessageHelper
```

to send branded No-Reply emails.

---

## Persistence Layer

Stores every notification with status updates.

```text
PENDING
↓

SENT

or

FAILED
```

---

# 🗄 Database Schema

```sql
CREATE TABLE notifications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    recipient VARCHAR(255),

    subject VARCHAR(255),

    content TEXT,

    status VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 🚀 Getting Started

## Prerequisites

- Java 17+
- Maven
- Node.js 18+
- Apache Kafka (KRaft Mode)
- MariaDB

---

## Clone Repository

```bash
git clone https://github.com/yourusername/event-driven-notification-engine.git

cd event-driven-notification-engine
```

---

## Start Kafka

```bash
./bin/kafka-storage.sh format \
-t <cluster-id> \
-c ./config/kraft/server.properties

./bin/kafka-server-start.sh \
./config/kraft/server.properties
```

---

## Run Spring Boot

```bash
./mvnw spring-boot:run
```

---

## Run Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📬 Notification Lifecycle

```text
Next.js
   │
   ▼
Kafka Topic
   │
   ▼
Spring Consumer
   │
   ▼
Save PENDING
   │
   ▼
Send Email
   │
   ├──────────────► Success
   │                    │
   │                    ▼
   │                 Update SENT
   │
   ▼
Retry
   │
   ▼
Retry
   │
   ▼
Retry
   │
   ▼
Dead Letter Topic
   │
   ▼
Update FAILED
```

---

# 🔮 Future Enhancements

- SMS Notifications
- Push Notifications
- WhatsApp Integration
- Email Templates (HTML)
- RabbitMQ Support
- Redis Rate Limiting
- Docker Compose
- Kubernetes Deployment
- Prometheus & Grafana Monitoring
- Authentication using JWT
- Notification Scheduling

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Kartik Nigam**

Java Backend Developer • Spring Boot • Kafka • Distributed Systems • Microservices

If you found this project useful, don't forget to ⭐ the repository!