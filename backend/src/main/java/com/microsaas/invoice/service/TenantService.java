package com.microsaas.invoice.service;

import com.microsaas.invoice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final JwtTokenProvider jwtTokenProvider;

    public String getCurrentTenantId() {
        return jwtTokenProvider.getTenantIdFromContext();
    }

    public String getCurrentUserId() {
        return jwtTokenProvider.getUserIdFromContext();
    }
}
