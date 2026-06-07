package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.InvoiceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@microsaas.com}")
    private String fromEmail;

    @Value("${app.name:InvoicePro Platform}")
    private String appName;

    public void sendInvoiceEmail(String toEmail, InvoiceDTO invoice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Invoice #" + invoice.getInvoiceNumber() + " from " + appName);
            helper.setText(buildInvoiceEmailBody(invoice), true);

            mailSender.send(message);
            log.info("Invoice email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send invoice email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send invoice email", e);
        }
    }

    private String buildInvoiceEmailBody(InvoiceDTO invoice) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style=\"font-family: Arial, sans-serif;\">");
        html.append("<h2>Invoice #").append(invoice.getInvoiceNumber()).append("</h2>");
        html.append("<p>Dear ").append(invoice.getCustomerName()).append(",</p>");
        html.append("<p>Please find below the details of your invoice:</p>");

        html.append("<table style=\"width: 100%; border-collapse: collapse;\">");
        html.append("<tr style=\"background-color: #f0f0f0;\">");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Item</th>");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: right;\">Quantity</th>");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: right;\">Unit Price</th>");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: right;\">Total</th>");
        html.append("</tr>");

        if (invoice.getItems() != null) {
            for (var item : invoice.getItems()) {
                BigDecimal total = item.getQuantity().multiply(item.getUnitPrice());
                html.append("<tr>");
                html.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(item.getName())
                        .append("</td>");
                html.append("<td style=\"border: 1px solid #ddd; padding: 8px; text-align: right;\">")
                        .append(item.getQuantity()).append("</td>");
                html.append("<td style=\"border: 1px solid #ddd; padding: 8px; text-align: right;\">₹")
                        .append(String.format("%.2f", item.getUnitPrice())).append("</td>");
                html.append("<td style=\"border: 1px solid #ddd; padding: 8px; text-align: right;\">₹")
                        .append(String.format("%.2f", total)).append("</td>");
                html.append("</tr>");
            }
        }

        html.append("</table>");

        html.append("<div style=\"margin-top: 20px;\">");
        html.append("<p><strong>Subtotal:</strong> ₹").append(String.format("%.2f", invoice.getSubtotal()))
                .append("</p>");
        html.append("<p><strong>Tax:</strong> ₹").append(String.format("%.2f", invoice.getTaxTotal())).append("</p>");
        html.append("<p style=\"font-size: 18px; color: #000;\"><strong>Total: ₹")
                .append(String.format("%.2f", invoice.getGrandTotal())).append("</strong></p>");
        html.append("</div>");

        html.append("<p>Issue Date: ").append(invoice.getIssueDate()).append("</p>");
        html.append("<p>Due Date: ").append(invoice.getDueDate()).append("</p>");

        if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
            html.append("<p><strong>Notes:</strong></p>");
            html.append("<p>").append(invoice.getNotes()).append("</p>");
        }

        html.append("<p>Thank you for your business!</p>");
        html.append("<p>Best regards,<br/>").append(appName).append("</p>");
        html.append("</body></html>");

        return html.toString();
    }
}
