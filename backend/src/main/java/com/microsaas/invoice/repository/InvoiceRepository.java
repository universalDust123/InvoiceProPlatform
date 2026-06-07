package com.microsaas.invoice.repository;


import com.microsaas.invoice.entity.Invoice;
import com.microsaas.invoice.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Page<Invoice> findByTenantId(String tenantId, Pageable pageable);

    List<Invoice> findByTenantIdAndStatus(String tenantId, InvoiceStatus status);

    Page<Invoice> findByTenantIdAndInvoiceNumberContaining(String tenantId, String invoiceNumber, Pageable pageable);

    Optional<Invoice> findByInvoiceNumberAndTenantId(String invoiceNumber, String tenantId);

    Page<Invoice> findByTenantIdAndUserId(String tenantId, String userId, Pageable pageable);
}
