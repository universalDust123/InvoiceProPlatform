package com.microsaas.invoice.config;

import com.microsaas.invoice.security.AuditLoggingInterceptor;
import com.microsaas.invoice.security.RateLimitingInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Configuration for Security Interceptors
 * 
 * Registers rate limiting and audit logging interceptors
 * to enhance API security and monitoring.
 */
@Configuration
@RequiredArgsConstructor
public class WebSecurityConfig implements WebMvcConfigurer {

    private final RateLimitingInterceptor rateLimitingInterceptor;
    private final AuditLoggingInterceptor auditLoggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register audit logging first (so it logs all requests)
        registry.addInterceptor(auditLoggingInterceptor)
                .addPathPatterns("/api/**")
                .order(1);

        // Register rate limiting interceptor
        registry.addInterceptor(rateLimitingInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register", "/api/auth/refresh")
                .order(2);
    }
}
