package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.CustomerDTO;
import com.microsaas.invoice.entity.Customer;
import com.microsaas.invoice.exception.ResourceNotFoundException;
import com.microsaas.invoice.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantService tenantService;

    @Cacheable(
        value = "customerList",
        key = "#tenantId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize"
    )
    public Page<CustomerDTO> getCustomers(Pageable pageable, String tenantId) {
        return customerRepository.findByTenantId(tenantId, pageable)
                .map(this::convertToDTO);
    }

    public Page<CustomerDTO> searchCustomers(String name, Pageable pageable) {
        String tenantId = tenantService.getCurrentTenantId();
        return customerRepository.findByTenantIdAndNameContainingIgnoreCase(tenantId, name, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(
        value = "allCustomers",
        key = "#tenantId"
    )
    public List<CustomerDTO> getAllCustomers(String tenantId) {
        return customerRepository.findByTenantId(tenantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(
        value = "customerDetails",
        key = "#tenantId + ':' + #id"
    )
    public CustomerDTO getCustomerById(String id, String tenantId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        validateTenantAccess(customer.getTenantId());
        return convertToDTO(customer);
    }

    @Caching(evict = {
        @CacheEvict(value = "customerList", allEntries = true),
        @CacheEvict(value = "allCustomers", allEntries = true),
        @CacheEvict(value = "customerSearch", allEntries = true),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    })
    public CustomerDTO createCustomer(CustomerDTO customerDTO, String tenantId) {

        Customer customer = Customer.builder()
                .tenantId(tenantId)
                .name(customerDTO.getName())
                .email(customerDTO.getEmail())
                .phone(customerDTO.getPhone())
                .billingAddress(customerDTO.getBillingAddress())
                .taxId(customerDTO.getTaxId())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return convertToDTO(savedCustomer);
    }

   @Caching(evict = {
        @CacheEvict(
            value = "customerDetails",
            key = "#tenantId + ':' + #id"
        ),
        @CacheEvict(value = "customerList", allEntries = true),
        @CacheEvict(value = "allCustomers", allEntries = true),
        @CacheEvict(value = "customerSearch", allEntries = true),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    })
    public CustomerDTO updateCustomer(String id, String tenantId, CustomerDTO customerDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        validateTenantAccess(customer.getTenantId());

        customer.setName(customerDTO.getName());
        customer.setEmail(customerDTO.getEmail());
        customer.setPhone(customerDTO.getPhone());
        customer.setBillingAddress(customerDTO.getBillingAddress());
        customer.setTaxId(customerDTO.getTaxId());

        Customer updatedCustomer = customerRepository.save(customer);
        return convertToDTO(updatedCustomer);
    }

    @Caching(evict = {
        @CacheEvict(value = "customerDetails",
                key = "#tenantId + ':' + #id"),
        @CacheEvict(value = "customerList", allEntries = true),
        @CacheEvict(value = "allCustomers", allEntries = true),
        @CacheEvict(value = "customerSearch", allEntries = true),
        @CacheEvict(value = "dashboardStats", allEntries = true)
    })
    public void deleteCustomer(String id, String tenantId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        validateTenantAccess(customer.getTenantId());
        customerRepository.deleteById(id);
    }

    private void validateTenantAccess(String customerTenantId) {
        String currentTenantId = tenantService.getCurrentTenantId();
        if (!customerTenantId.equals(currentTenantId)) {
            throw new ResourceNotFoundException("Customer not found");
        }
    }

    private CustomerDTO convertToDTO(Customer customer) {
        return CustomerDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .billingAddress(customer.getBillingAddress())
                .taxId(customer.getTaxId())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
