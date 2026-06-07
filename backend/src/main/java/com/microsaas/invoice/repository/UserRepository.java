package com.microsaas.invoice.repository;

import com.microsaas.invoice.entity.User;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailAndTenantId(String email, String tenantId);

    @NonNull
    Optional<User> findById(@NonNull String id);

    Optional<User> findByEmail(String email);
}
