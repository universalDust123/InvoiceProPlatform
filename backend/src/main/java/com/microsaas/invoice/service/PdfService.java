package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.InvoiceDTO;
import com.microsaas.invoice.dto.InvoiceItemDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfService {

    public byte[] generateInvoicePdf(InvoiceDTO invoice) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Add title
            Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD);
            Paragraph title = new Paragraph("INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph invoiceNum = new Paragraph("#" + invoice.getInvoiceNumber());
            invoiceNum.setAlignment(Element.ALIGN_CENTER);
            document.add(invoiceNum);

            document.add(new Paragraph(" "));

            // Invoice details
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 11);

            document.add(new Paragraph("Customer: " + invoice.getCustomerName(), normalFont));
            document.add(new Paragraph("Issue Date: " + invoice.getIssueDate(), normalFont));
            document.add(new Paragraph("Due Date: " + invoice.getDueDate(), normalFont));
            document.add(new Paragraph("Status: " + invoice.getStatus(), normalFont));

            document.add(new Paragraph(" "));

            // Line items table
            Table table = new Table(6);
            table.setWidth(100);
            table.setPadding(5);
            table.setBorderColor(new Color(200, 200, 200));

            // Header row
            table.addCell(createHeaderCell("Item", labelFont));
            table.addCell(createHeaderCell("Description", labelFont));
            table.addCell(createHeaderCell("Qty", labelFont));
            table.addCell(createHeaderCell("Unit Price", labelFont));
            table.addCell(createHeaderCell("Tax %", labelFont));
            table.addCell(createHeaderCell("Total", labelFont));

            // Data rows
            if (invoice.getItems() != null) {
                for (InvoiceItemDTO item : invoice.getItems()) {
                    BigDecimal total = item.getQuantity().multiply(item.getUnitPrice());
                    table.addCell(new Cell(item.getName()));
                    table.addCell(new Cell(item.getDescription() != null ? item.getDescription() : ""));
                    table.addCell(new Cell(item.getQuantity().toString()));
                    table.addCell(new Cell("₹" + String.format("%.2f", item.getUnitPrice())));
                    table.addCell(new Cell(item.getTaxPercentage() + "%"));
                    table.addCell(new Cell("₹" + String.format("%.2f", total)));
                }
            }

            document.add(table);
            document.add(new Paragraph(" "));

            // Totals
            Font totalsFont = new Font(Font.HELVETICA, 11);
            document.add(new Paragraph("Subtotal: ₹" + String.format("%.2f", invoice.getSubtotal()), totalsFont));
            document.add(new Paragraph("Tax: ₹" + String.format("%.2f", invoice.getTaxTotal()), totalsFont));

            Font grandTotalFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            document.add(new Paragraph("Grand Total: ₹" + String.format("%.2f", invoice.getGrandTotal()),
                    grandTotalFont));

            // Notes
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Notes:", labelFont));
                document.add(new Paragraph(invoice.getNotes(), normalFont));
            }

            document.close();

            log.info("PDF generated successfully for invoice: {}", invoice.getInvoiceNumber());
            return outputStream.toByteArray();
        } catch (DocumentException e) {
            log.error("Failed to generate PDF for invoice: {}", invoice.getInvoiceNumber(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private Cell createHeaderCell(String text, Font font) throws BadElementException {
        Cell cell = new Cell(text);
        cell.setHeader(true);
        cell.setBackgroundColor(new Color(220, 220, 220));
        return cell;
    }
}
