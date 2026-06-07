package com.microsaas.invoice.repository;

import com.microsaas.invoice.entity.LineItemTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LineItemTemplateRepository extends JpaRepository<LineItemTemplate, String> {
    Page<LineItemTemplate> findByTenantId(String tenantId, Pageable pageable);

    List<LineItemTemplate> findByTenantId(String tenantId);
}
