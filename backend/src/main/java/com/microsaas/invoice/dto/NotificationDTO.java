package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String actionUrl;
    private LocalDateTime createdAt;
}
