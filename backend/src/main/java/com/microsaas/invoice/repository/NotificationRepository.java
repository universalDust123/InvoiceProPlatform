package com.microsaas.invoice.repository;

import com.microsaas.invoice.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    Page<Notification> findByUserIdAndTenantIdOrderByCreatedAtDesc(
            String userId, String tenantId, Pageable pageable);

    List<Notification> findByUserIdAndTenantIdAndIsReadFalseOrderByCreatedAtDesc(
            String userId, String tenantId);

    long countByUserIdAndTenantIdAndIsReadFalse(String userId, String tenantId);

    void deleteByUserIdAndTenantId(String userId, String tenantId);
}
