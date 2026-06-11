package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.InvoiceDTO;
import com.microsaas.invoice.dto.InvoiceItemDTO;
import com.microsaas.invoice.entity.*;
import com.microsaas.invoice.exception.InvalidOperationException;
import com.microsaas.invoice.exception.ResourceNotFoundException;
import com.microsaas.invoice.repository.CustomerRepository;
import com.microsaas.invoice.repository.InvoiceRepository;
import com.microsaas.invoice.repository.UserRepository;
import com.microsaas.invoice.security.JwtUserPrincipal;
import com.microsaas.invoice.repository.InvoiceItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
// import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;
    private final EmailService emailService;
    private final PdfService pdfService;
    private final NotificationService notificationService;

    // @Cacheable(
    //     value = "invoiceList",
    //     key = "#tenantId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize"
    // )
    public Page<InvoiceDTO> getInvoices(Pageable pageable, String tenantId) {
        String userId = tenantService.getCurrentUserId();
        return invoiceRepository.findByTenantIdAndUserId(tenantId, userId, pageable)
                .map(this::convertToDTO);
    }

    public Page<InvoiceDTO> searchInvoices(String invoiceNumber, Pageable pageable) {
        String tenantId = tenantService.getCurrentTenantId();
        return invoiceRepository.findByTenantIdAndInvoiceNumberContaining(tenantId, invoiceNumber, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(value = "invoiceDetails", key = "#tenantId + ':' + #id")
    public InvoiceDTO getInvoiceById(String id, String tenantId) {
        if (tenantId == null || id == null) {
            throw new IllegalStateException("Tenant ID and invoice ID cannot be null");
        }
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());
        return convertToDTO(invoice);
    }

    @Caching(evict = {
        @CacheEvict(
            value = "invoiceDetails",
            key = "#tenantId + ':' + #id"
        ),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    })     
    public InvoiceDTO createInvoice(InvoiceDTO invoiceDTO, String tenantId) {
        String userId = tenantService.getCurrentUserId();
        if (tenantId == null || userId == null) {
            throw new IllegalStateException("Tenant ID and user ID cannot be null");
        }
        Customer customer = customerRepository.findById(invoiceDTO.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateTenantAccess(customer.getTenantId());

        Invoice invoice = Invoice.builder()
                .tenantId(tenantId)
                .customer(customer)
                .user(user)
                .invoiceNumber(generateInvoiceNumber(tenantId))
                .issueDate(invoiceDTO.getIssueDate())
                .dueDate(invoiceDTO.getDueDate())
                .subtotal(invoiceDTO.getSubtotal())
                .taxTotal(invoiceDTO.getTaxTotal())
                .grandTotal(invoiceDTO.getGrandTotal())
                .status(InvoiceStatus.DRAFT)
                .notes(invoiceDTO.getNotes())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Create invoice items and calculate totals
        List<InvoiceItem> items = invoiceDTO.getItems().stream()
                .map(itemDTO -> createInvoiceItem(itemDTO, savedInvoice))
                .collect(Collectors.toList());

        savedInvoice.setItems(items);
        calculateInvoiceTotals(savedInvoice);

        Invoice finalInvoice = invoiceRepository.save(savedInvoice);
        return convertToDTO(finalInvoice);
    }

    @Caching(evict = {
        @CacheEvict(
            value = "invoiceDetails",
            key = "#tenantId + ':' + #id"
        ),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    })      
    public InvoiceDTO updateInvoice(String id, String tenantId, InvoiceDTO invoiceDTO) {
        if (tenantId == null || id == null) {
            throw new IllegalStateException("Tenant ID and invoice ID cannot be null");
        }
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidOperationException("Can only edit invoices in DRAFT status");
        }

        Customer customer = customerRepository.findById(invoiceDTO.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        invoice.setCustomer(customer);
        invoice.setIssueDate(invoiceDTO.getIssueDate());
        invoice.setDueDate(invoiceDTO.getDueDate());
        invoice.setNotes(invoiceDTO.getNotes());

        // Clear existing items
        invoice.getItems().clear();

        log.info("Updating invoice items for invoice: {}", invoice.getId());
        log.info("data received: {}", invoiceDTO.getItems());

        // Add updated items
        if (invoiceDTO.getItems() != null) {

            List<InvoiceItem> updatedItems = invoiceDTO.getItems()
                    .stream()
                    .map(itemDTO -> createInvoiceItem(itemDTO, invoice))
                    .collect(Collectors.toList());

            for (InvoiceItem item : updatedItems) {
                item.setInvoice(invoice);
                invoice.getItems().add(item);
            }
        }

        // Recalculate totals
        calculateInvoiceTotals(invoice);

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        // log.info("Invoice updated successfully: {}", updatedInvoice.toString());
        return convertToDTO(updatedInvoice);
    }

    @Caching(evict = {
        @CacheEvict(
            value = "invoiceDetails",
            key = "#tenantId + ':' + #id"
        ),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    })  
    public InvoiceDTO sendInvoice(String id, String tenantId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidOperationException("Only draft invoices can be sent");
        }

        if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
            throw new InvalidOperationException("Invoice must have at least one item");
        }

        invoice.setStatus(InvoiceStatus.SENT);
        Invoice updatedInvoice = invoiceRepository.save(invoice);

        // Create notification
        String userId = getCurrentUserId();
        notificationService.createNotification(
                userId,
                tenantId,
                "Invoice Sent",
                "Invoice #" + invoice.getInvoiceNumber() + " has been sent to " + invoice.getCustomer().getName(),
                NotificationType.INVOICE,
                "/invoices/" + invoice.getId());

        return convertToDTO(updatedInvoice);
    }

    
    @Caching(evict = {
        @CacheEvict(
            value = "invoiceDetails",
            key = "#tenantId + ':' + #id"
        ),
        @CacheEvict(value = "dashboardStats", allEntries = true),
        @CacheEvict(value = "invoiceList", allEntries = true)
    })  
    public InvoiceDTO markAsPaid(String id, String tenantId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());
        invoice.setStatus(InvoiceStatus.PAID);
        Invoice updatedInvoice = invoiceRepository.save(invoice);

        // Create notification
        String userId = getCurrentUserId();
        notificationService.createNotification(
                userId,
                tenantId,
                "Payment Received",
                "Invoice #" + invoice.getInvoiceNumber() + " for " + invoice.getGrandTotal()
                        + " has been marked as paid",
                NotificationType.PAYMENT,
                "/invoices/" + invoice.getId());

        return convertToDTO(updatedInvoice);
    }

     @Caching(evict = {
        @CacheEvict(
            value = "invoiceDetails",
            key = "#tenantId + ':' + #id"
        ),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    }) 
    public void deleteInvoice(String id, String tenantId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidOperationException("Can only delete draft invoices");
        }

        invoiceRepository.deleteById(id);
    }

    public void sendInvoiceByEmail(String id) {
        String tenantId = tenantService.getCurrentTenantId();
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());

        InvoiceDTO invoiceDTO = convertToDTO(invoice);
        emailService.sendInvoiceEmail(invoice.getCustomer().getEmail(), invoiceDTO);
    }

    public byte[] getInvoicePdf(String id) {
        String tenantId = tenantService.getCurrentTenantId();
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        validateTenantAccess(invoice.getTenantId());

        InvoiceDTO invoiceDTO = convertToDTO(invoice);
        return pdfService.generateInvoicePdf(invoiceDTO);
    }

    private InvoiceItem createInvoiceItem(InvoiceItemDTO itemDTO, Invoice invoice) {
        BigDecimal lineTotal = itemDTO.getQuantity()
                .multiply(itemDTO.getUnitPrice())
                .setScale(2, RoundingMode.HALF_UP);

        return InvoiceItem.builder()
                .invoice(invoice)
                .name(itemDTO.getName())
                .description(itemDTO.getDescription())
                .quantity(itemDTO.getQuantity())
                .unitPrice(itemDTO.getUnitPrice())
                .taxPercentage(itemDTO.getTaxPercentage())
                .lineTotal(lineTotal)
                .build();
    }

    private void calculateInvoiceTotals(Invoice invoice) {
        BigDecimal subtotal = invoice.getItems().stream()
                .map(item -> item.getQuantity().multiply(item.getUnitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal taxTotal = invoice.getItems().stream()
                .map(item -> item.getQuantity()
                        .multiply(item.getUnitPrice())
                        .multiply(item.getTaxPercentage())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal grandTotal = subtotal.add(taxTotal).setScale(2, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal);
        invoice.setTaxTotal(taxTotal);
        invoice.setGrandTotal(grandTotal);
    }

    private String generateInvoiceNumber(String tenantId) {
        List<Invoice> invoices = invoiceRepository.findByTenantIdAndStatus(tenantId, InvoiceStatus.DRAFT);
        int nextNumber = invoices.size() + 1;
        return "INV-" + System.currentTimeMillis() + "-" + nextNumber;
    }

    private void validateTenantAccess(String invoiceTenantId) {
        String currentTenantId = tenantService.getCurrentTenantId();
        if (!invoiceTenantId.equals(currentTenantId)) {
            throw new ResourceNotFoundException("Invoice not found");
        }
    }

    private String getCurrentUserId() {
        JwtUserPrincipal principal = (JwtUserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return principal.getId();
    }

    private InvoiceDTO convertToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomerName())
                .invoiceNumber(invoice.getInvoiceNumber())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .subtotal(invoice.getSubtotal())
                .taxTotal(invoice.getTaxTotal())
                .grandTotal(invoice.getGrandTotal())
                .status(invoice.getStatus().toString())
                .notes(invoice.getNotes())
                .items(invoice.getItems().stream()
                        .map(this::convertItemToDTO)
                        .collect(Collectors.toList()))
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }

    private InvoiceItemDTO convertItemToDTO(InvoiceItem item) {
        return InvoiceItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .taxPercentage(item.getTaxPercentage())
                .lineTotal(item.getLineTotal())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
