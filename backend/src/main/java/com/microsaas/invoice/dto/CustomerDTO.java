package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {
    private String id;

    @NotBlank(message = "Customer name is required")
    private String name;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    private String phone;
    private String billingAddress;
    private String taxId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
