package com.microsaas.invoice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferencesDTO {
    @NotBlank(message = "Theme preference is required")
    @Builder.Default
    private String theme = "dark";
}
