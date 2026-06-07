package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineItemTemplateDTO {
    private String id;

    @NotBlank(message = "Template name is required")
    private String name;

    private String description;

    @NotNull(message = "Default price is required")
    @DecimalMin("0.01")
    private BigDecimal defaultPrice;

    @NotNull(message = "Tax percentage is required")
    @DecimalMin("0.00")
    private BigDecimal taxPercentage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
