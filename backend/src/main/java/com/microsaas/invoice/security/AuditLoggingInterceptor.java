package com.microsaas.invoice.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Audit Logging Interceptor
 * 
 * Logs all sensitive operations for compliance and security auditing:
 * - All POST, PUT, DELETE operations
 * - User authentication events
 * - Authorization failures
 * - Sensitive data access
 */
@Slf4j
@Component
public class AuditLoggingInterceptor implements HandlerInterceptor {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final String AUDIT_LOG = "[AUDIT LOG]";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        // Log sensitive operations
        if (isSensitiveOperation(method, uri)) {
            log.info("{} Operation - Method: {}, URI: {}, ClientIP: {}, Time: {}",
                    AUDIT_LOG,
                    method,
                    uri,
                    clientIp,
                    LocalDateTime.now().format(formatter));
        }

        // Log authentication attempts
        if (uri.contains("/api/auth/")) {
            log.info("{} Authentication Attempt - Action: {}, URI: {}, ClientIP: {}, UserAgent: {}, Time: {}",
                    AUDIT_LOG,
                    extractAuthAction(uri),
                    uri,
                    clientIp,
                    userAgent,
                    LocalDateTime.now().format(formatter));
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) throws Exception {

        int status = response.getStatus();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String clientIp = getClientIpAddress(request);

        // Log failed authorization (401, 403)
        if (status == 401 || status == 403) {
            log.warn("{} Authorization Failed - Status: {}, Method: {}, URI: {}, ClientIP: {}, Time: {}",
                    AUDIT_LOG,
                    status,
                    method,
                    uri,
                    clientIp,
                    LocalDateTime.now().format(formatter));
        }

        // Log errors during sensitive operations
        if (isSensitiveOperation(method, uri) && status >= 400) {
            log.error("{} Operation Failed - Status: {}, Method: {}, URI: {}, ClientIP: {}, Error: {}, Time: {}",
                    AUDIT_LOG,
                    status,
                    method,
                    uri,
                    clientIp,
                    ex != null ? ex.getMessage() : "Unknown",
                    LocalDateTime.now().format(formatter));
        }
    }

    private boolean isSensitiveOperation(String method, String uri) {
        // Flag all write operations and sensitive reads
        return method.matches("POST|PUT|DELETE|PATCH") ||
                uri.contains("/api/invoices/") ||
                uri.contains("/api/customers/") ||
                uri.contains("/api/users/") ||
                uri.contains("/api/auth/");
    }

    private String extractAuthAction(String uri) {
        if (uri.contains("/login"))
            return "LOGIN";
        if (uri.contains("/register"))
            return "REGISTER";
        if (uri.contains("/refresh"))
            return "REFRESH_TOKEN";
        return "AUTH_ACTION";
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0];
            }
        }

        return request.getRemoteAddr();
    }
}
