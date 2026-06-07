package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.NotificationDTO;
import com.microsaas.invoice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all notifications with pagination")
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getNotifications(page, size));
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications());
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", notificationService.getUnreadCount());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete all notifications")
    public ResponseEntity<Void> deleteAllNotifications() {
        notificationService.deleteAllNotifications();
        return ResponseEntity.noContent().build();
    }
}
