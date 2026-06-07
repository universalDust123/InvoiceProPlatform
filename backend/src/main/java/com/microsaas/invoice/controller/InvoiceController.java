package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.InvoiceDTO;
import com.microsaas.invoice.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice management endpoints")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "Get all invoices with pagination")
    public ResponseEntity<Page<InvoiceDTO>> getInvoices(Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getInvoices(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search invoices by invoice number")
    public ResponseEntity<Page<InvoiceDTO>> searchInvoices(@RequestParam String invoiceNumber, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.searchInvoices(invoiceNumber, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping
    @Operation(summary = "Create new invoice")
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody InvoiceDTO invoiceDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(invoiceDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update invoice (only DRAFT status)")
    public ResponseEntity<InvoiceDTO> updateInvoice(@PathVariable String id,
            @Valid @RequestBody InvoiceDTO invoiceDTO) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, invoiceDTO));
    }

    @PostMapping("/{id}/send")
    @Operation(summary = "Send invoice (changes status to SENT, making it immutable)")
    public ResponseEntity<InvoiceDTO> sendInvoice(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.sendInvoice(id));
    }

    @PostMapping("/{id}/mark-paid")
    @Operation(summary = "Mark invoice as paid")
    public ResponseEntity<InvoiceDTO> markAsPaid(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.markAsPaid(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete invoice (only DRAFT status)")
    public ResponseEntity<Void> deleteInvoice(@PathVariable String id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/send-email")
    @Operation(summary = "Send invoice by email to customer")
    public ResponseEntity<Void> sendInvoiceByEmail(@PathVariable String id) {
        invoiceService.sendInvoiceByEmail(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download-pdf")
    @Operation(summary = "Download invoice as PDF")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable String id) {

        byte[] pdfContent = invoiceService.getInvoicePdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice_" + id + ".pdf")
                .body(pdfContent);
    }
}
