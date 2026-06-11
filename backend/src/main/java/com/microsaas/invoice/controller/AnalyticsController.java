package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.DashboardStatsDTO;
import com.microsaas.invoice.service.AnalyticsService;
import com.microsaas.invoice.service.TenantService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and dashboard endpoints")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
     private final TenantService tenantService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {

        String tenantId = tenantService.getCurrentTenantId();

        return ResponseEntity.ok(analyticsService.getDashboardStats(tenantId));
    }
}
