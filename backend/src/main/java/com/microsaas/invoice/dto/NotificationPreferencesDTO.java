package com.microsaas.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesDTO {
    @Builder.Default
    private Boolean paymentReminders = true;

    @Builder.Default
    private Boolean invoiceSentConfirmations = true;

    @Builder.Default
    private Boolean weeklyReports = true;

    @Builder.Default
    private Boolean securityAlerts = true;
}
