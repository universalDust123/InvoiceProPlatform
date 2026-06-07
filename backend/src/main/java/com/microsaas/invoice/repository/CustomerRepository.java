package com.microsaas.invoice.repository;

import com.microsaas.invoice.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    Page<Customer> findByTenantId(String tenantId, Pageable pageable);

    List<Customer> findByTenantId(String tenantId);

    Page<Customer> findByTenantIdAndNameContainingIgnoreCase(String tenantId, String name, Pageable pageable);
}
