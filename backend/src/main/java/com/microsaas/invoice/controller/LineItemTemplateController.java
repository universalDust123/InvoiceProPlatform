package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.LineItemTemplateDTO;
import com.microsaas.invoice.service.LineItemTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/line-item-templates")
@RequiredArgsConstructor
@Tag(name = "Line Item Templates", description = "Product/Service template endpoints")
public class LineItemTemplateController {

    private final LineItemTemplateService templateService;

    @GetMapping
    @Operation(summary = "Get all templates with pagination")
    public ResponseEntity<Page<LineItemTemplateDTO>> getTemplates(Pageable pageable) {
        return ResponseEntity.ok(templateService.getTemplates(pageable));
    }

    @GetMapping("/list")
    @Operation(summary = "Get all templates as list")
    public ResponseEntity<List<LineItemTemplateDTO>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get template by ID")
    public ResponseEntity<LineItemTemplateDTO> getTemplateById(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PostMapping
    @Operation(summary = "Create new template")
    public ResponseEntity<LineItemTemplateDTO> createTemplate(@Valid @RequestBody LineItemTemplateDTO templateDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.createTemplate(templateDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update template")
    public ResponseEntity<LineItemTemplateDTO> updateTemplate(@PathVariable String id,
            @Valid @RequestBody LineItemTemplateDTO templateDTO) {
        return ResponseEntity.ok(templateService.updateTemplate(id, templateDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete template")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
