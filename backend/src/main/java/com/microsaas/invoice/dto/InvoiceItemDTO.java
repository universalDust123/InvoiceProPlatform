package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemDTO {
    private String id;

    @NotNull(message = "Item name is required")
    private String name;

    private String description;

    @NotNull(message = "Quantity is required")
    @DecimalMin("0.01")
    private BigDecimal quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin("0.01")
    private BigDecimal unitPrice;

    @NotNull(message = "Tax percentage is required")
    @DecimalMin("0.00")
    private BigDecimal taxPercentage;

    private BigDecimal lineTotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
