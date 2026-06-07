package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.CustomerDTO;
import com.microsaas.invoice.service.CustomerService;
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

    @GetMapping
    @Operation(summary = "Get all customers with pagination")
    public ResponseEntity<Page<CustomerDTO>> getCustomers(Pageable pageable) {
        return ResponseEntity.ok(customerService.getCustomers(pageable));
    }

    @GetMapping("/list")
    @Operation(summary = "Get all customers as list")
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers by name")
    public ResponseEntity<Page<CustomerDTO>> searchCustomers(@RequestParam String name, Pageable pageable) {
        return ResponseEntity.ok(customerService.searchCustomers(name, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable String id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @Operation(summary = "Create new customer")
    public ResponseEntity<CustomerDTO> createCustomer(@Valid @RequestBody CustomerDTO customerDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customerDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable String id, @Valid @RequestBody CustomerDTO customerDTO) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customerDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
