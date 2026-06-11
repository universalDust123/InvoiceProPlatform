package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long totalInvoices;
    private Long totalCustomers;
    private BigDecimal totalRevenue;
    private BigDecimal pendingAmount;
    private Long paidInvoices;
    private Long draftInvoices;
    private Long overdueInvoices;
}