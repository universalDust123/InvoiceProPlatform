package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.NotificationDTO;
import com.microsaas.invoice.entity.Notification;
import com.microsaas.invoice.entity.NotificationType;
import com.microsaas.invoice.repository.NotificationRepository;
import com.microsaas.invoice.security.JwtUserPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.juli.logging.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Get current user from authentication context
     */
    private String getCurrentUserId() {
        JwtUserPrincipal principal = (JwtUserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return principal.getId();
    }

    /**
     * Get current user's tenant ID from authentication context
     */
    private String getCurrentTenantId() {
        JwtUserPrincipal principal = (JwtUserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return principal.getTenantId();
    }

    /**
     * Create notification for user
     */
    public NotificationDTO createNotification(String userId, String tenantId, String title,
            String message, NotificationType type, String actionUrl) {
        Notification notification = Notification.builder()
                .userId(userId)
                .tenantId(tenantId)
                .title(title)
                .message(message)
                .type(type)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }

    /**
     * Get all notifications for current user
     */
    public Page<NotificationDTO> getNotifications(int page, int size) {
        String userId = getCurrentUserId();
        String tenantId = getCurrentTenantId();

        log.info("Fetching notifications for userId: {}, tenantId: {}", userId, tenantId);

        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository
                .findByUserIdAndTenantIdOrderByCreatedAtDesc(userId, tenantId, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Get unread notifications
     */
    public List<NotificationDTO> getUnreadNotifications() {
        String userId = getCurrentUserId();
        String tenantId = getCurrentTenantId();

        return notificationRepository
                .findByUserIdAndTenantIdAndIsReadFalseOrderByCreatedAtDesc(userId, tenantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount() {
        String userId = getCurrentUserId();
        String tenantId = getCurrentTenantId();

        return notificationRepository.countByUserIdAndTenantIdAndIsReadFalse(userId, tenantId);
    }

    /**
     * Mark notification as read
     */
    public NotificationDTO markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }

    /**
     * Mark all notifications as read
     */
    public void markAllAsRead() {
        String userId = getCurrentUserId();
        String tenantId = getCurrentTenantId();

        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndTenantIdAndIsReadFalseOrderByCreatedAtDesc(userId, tenantId);

        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Delete notification
     */
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Delete all notifications
     */
    public void deleteAllNotifications() {
        String userId = getCurrentUserId();
        String tenantId = getCurrentTenantId();

        notificationRepository.deleteByUserIdAndTenantId(userId, tenantId);
    }

    /**
     * Convert Notification entity to DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().toString())
                .isRead(notification.getIsRead())
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
