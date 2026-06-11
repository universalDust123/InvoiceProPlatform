package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.CustomerDTO;
import com.microsaas.invoice.service.CustomerService;
import com.microsaas.invoice.service.TenantService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer management endpoints")
public class CustomerController {

    private final CustomerService customerService;
    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Get all customers with pagination")
    public ResponseEntity<Page<CustomerDTO>> getCustomers(Pageable pageable) {
        String tenantId = tenantService.getCurrentTenantId();
        return ResponseEntity.ok(customerService.getCustomers(pageable, tenantId));
    }

    @GetMapping("/list")
    @Operation(summary = "Get all customers as list")
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        String tenantId = tenantService.getCurrentTenantId();
        return ResponseEntity.ok(customerService.getAllCustomers(tenantId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers by name")
    public ResponseEntity<Page<CustomerDTO>> searchCustomers(@RequestParam String name, Pageable pageable) {
        return ResponseEntity.ok(customerService.searchCustomers(name, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable String id) {
        String tenantId = tenantService.getCurrentTenantId();
        return ResponseEntity.ok(customerService.getCustomerById(id, tenantId));
    }

    @PostMapping
    @Operation(summary = "Create new customer")
    public ResponseEntity<CustomerDTO> createCustomer(@Valid @RequestBody CustomerDTO customerDTO) {
        String tenantId = tenantService.getCurrentTenantId();
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customerDTO, tenantId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable String id, @Valid @RequestBody CustomerDTO customerDTO) {
        String tenantId = tenantService.getCurrentTenantId();
        return ResponseEntity.ok(customerService.updateCustomer(id,tenantId, customerDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        String tenantId = tenantService.getCurrentTenantId();
        customerService.deleteCustomer(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}
