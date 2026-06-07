package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.DashboardStatsDTO;
import com.microsaas.invoice.entity.InvoiceStatus;
import com.microsaas.invoice.repository.CustomerRepository;
import com.microsaas.invoice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final TenantService tenantService;

    public DashboardStatsDTO getDashboardStats() {
        String tenantId = tenantService.getCurrentTenantId();
        String userId = tenantService.getCurrentUserId();

        long totalInvoices = invoiceRepository
                .findByTenantIdAndUserId(tenantId, userId, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long totalCustomers = customerRepository.findByTenantId(tenantId).size();

        var paidInvoices = invoiceRepository.findByTenantIdAndStatus(tenantId, InvoiceStatus.PAID);
        var draftInvoices = invoiceRepository.findByTenantIdAndStatus(tenantId, InvoiceStatus.DRAFT);
        var overdueInvoices = invoiceRepository.findByTenantIdAndStatus(tenantId, InvoiceStatus.OVERDUE);

        BigDecimal totalRevenue = paidInvoices.stream()
                .map(invoice -> invoice.getGrandTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = invoiceRepository.findByTenantIdAndStatus(tenantId, InvoiceStatus.SENT).stream()
                .map(invoice -> invoice.getGrandTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardStatsDTO.builder()
                .totalInvoices(totalInvoices)
                .totalCustomers((long) totalCustomers)
                .totalRevenue(totalRevenue)
                .pendingAmount(pendingAmount)
                .paidInvoices((long) paidInvoices.size())
                .draftInvoices((long) draftInvoices.size())
                .overdueInvoices((long) overdueInvoices.size())
                .build();
    }
}
