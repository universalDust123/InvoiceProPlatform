package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.LineItemTemplateDTO;
import com.microsaas.invoice.entity.LineItemTemplate;
import com.microsaas.invoice.exception.ResourceNotFoundException;
import com.microsaas.invoice.repository.LineItemTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LineItemTemplateService {

    private final LineItemTemplateRepository templateRepository;
    private final TenantService tenantService;

    public Page<LineItemTemplateDTO> getTemplates(Pageable pageable) {
        String tenantId = tenantService.getCurrentTenantId();
        return templateRepository.findByTenantId(tenantId, pageable)
                .map(this::convertToDTO);
    }

    public List<LineItemTemplateDTO> getAllTemplates() {
        String tenantId = tenantService.getCurrentTenantId();
        return templateRepository.findByTenantId(tenantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LineItemTemplateDTO getTemplateById(String id) {
        String tenantId = tenantService.getCurrentTenantId();
        if (tenantId == null || id == null) {
            throw new IllegalStateException("Tenant ID and template ID cannot be null");
        }
        LineItemTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        validateTenantAccess(template.getTenantId());
        return convertToDTO(template);
    }

    public LineItemTemplateDTO createTemplate(LineItemTemplateDTO templateDTO) {
        String tenantId = tenantService.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant ID cannot be null");
        }

        LineItemTemplate template = LineItemTemplate.builder()
                .tenantId(tenantId)
                .name(templateDTO.getName())
                .description(templateDTO.getDescription())
                .defaultPrice(templateDTO.getDefaultPrice())
                .taxPercentage(templateDTO.getTaxPercentage())
                .build();
        if (template.getName() == null || template.getName().isEmpty()) {
            throw new IllegalArgumentException("Template name cannot be null or empty");
        }
        LineItemTemplate savedTemplate = templateRepository.save(template);
        return convertToDTO(savedTemplate);
    }

    public LineItemTemplateDTO updateTemplate(String id, LineItemTemplateDTO templateDTO) {
        String tenantId = tenantService.getCurrentTenantId();
        if (tenantId == null || id == null) {
            throw new IllegalStateException("Tenant ID and template ID cannot be null");
        }
        LineItemTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        validateTenantAccess(template.getTenantId());

        template.setName(templateDTO.getName());
        template.setDescription(templateDTO.getDescription());
        template.setDefaultPrice(templateDTO.getDefaultPrice());
        template.setTaxPercentage(templateDTO.getTaxPercentage());

        LineItemTemplate updatedTemplate = templateRepository.save(template);
        return convertToDTO(updatedTemplate);
    }

    public void deleteTemplate(String id) {
        String tenantId = tenantService.getCurrentTenantId();
        if (tenantId == null || id == null) {
            throw new IllegalStateException("Tenant ID and template ID cannot be null");
        }
        LineItemTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        validateTenantAccess(template.getTenantId());
        templateRepository.deleteById(id);
    }

    private void validateTenantAccess(String templateTenantId) {
        String currentTenantId = tenantService.getCurrentTenantId();
        if (!templateTenantId.equals(currentTenantId)) {
            throw new ResourceNotFoundException("Template not found");
        }
    }

    private LineItemTemplateDTO convertToDTO(LineItemTemplate template) {
        return LineItemTemplateDTO.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .defaultPrice(template.getDefaultPrice())
                .taxPercentage(template.getTaxPercentage())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
