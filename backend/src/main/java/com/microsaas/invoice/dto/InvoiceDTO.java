package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {
    private String id;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    private String customerName;

    // @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private BigDecimal subtotal;
    private BigDecimal taxTotal;
    private BigDecimal grandTotal;

    // @NotBlank(message = "Status is required")
    private String status;

    private String notes;

    @NotEmpty(message = "Invoice must have at least one item")
    @Valid
    private List<InvoiceItemDTO> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
