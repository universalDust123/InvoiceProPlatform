package com.microsaas.invoice.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Security Input Validator
 * 
 * Validates input to prevent common security vulnerabilities:
 * - SQL Injection
 * - XSS (Cross-Site Scripting)
 * - Path Traversal
 * - Command Injection
 * - Invalid Format
 */
@Slf4j
@Component
public class SecurityInputValidator {

    // Pattern for detecting SQL injection attempts
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "(?i)(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|" +
                    "SCRIPT|JAVASCRIPT|ONLOAD|ONCLICK|ALERT|EVAL|CONFIRM)\\b|--|;|/\\*|\\*/|xp_|sp_)");

    // Pattern for XSS attempts (basic - more sophisticated patterns exist)
    private static final Pattern XSS_PATTERN = Pattern.compile(
            "(?i)<[^>]*(script|iframe|object|embed|img|svg|link|style)[^>]*>|" +
                    "javascript:|on\\w+\\s*=|<svg.*onload|<img.*onerror");

    // Pattern for path traversal attempts
    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile("(\\.{2}[/\\\\])+|\\.{2}");

    // Pattern for invalid UUID format
    private static final Pattern UUID_PATTERN = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            Pattern.CASE_INSENSITIVE);

    // Pattern for valid email format
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@(.+)$");

    /**
     * Validates that input doesn't contain SQL injection attempts
     * 
     * @param input     User input to validate
     * @param fieldName Name of the field being validated
     * @return true if input is safe, false if potential injection detected
     */
    public boolean validateSQLSafety(String input, String fieldName) {
        if (input == null || input.trim().isEmpty()) {
            return true; // Empty input is safe
        }

        if (SQL_INJECTION_PATTERN.matcher(input).find()) {
            log.warn("Potential SQL Injection detected in field: {}, Input: {}", fieldName, maskSensitiveData(input));
            return false;
        }
        return true;
    }

    /**
     * Validates that input doesn't contain XSS attempts
     * 
     * @param input     User input to validate
     * @param fieldName Name of the field being validated
     * @return true if input is safe, false if potential XSS detected
     */
    public boolean validateXSSSafety(String input, String fieldName) {
        if (input == null || input.trim().isEmpty()) {
            return true; // Empty input is safe
        }

        if (XSS_PATTERN.matcher(input).find()) {
            log.warn("Potential XSS detected in field: {}", fieldName);
            return false;
        }
        return true;
    }

    /**
     * Validates that input doesn't contain path traversal attempts
     * 
     * @param input     User input to validate
     * @param fieldName Name of the field being validated
     * @return true if input is safe, false if potential traversal detected
     */
    public boolean validatePathTraversal(String input, String fieldName) {
        if (input == null || input.trim().isEmpty()) {
            return true; // Empty input is safe
        }

        if (PATH_TRAVERSAL_PATTERN.matcher(input).find()) {
            log.warn("Potential Path Traversal detected in field: {}", fieldName);
            return false;
        }
        return true;
    }

    /**
     * Validates UUID format
     * 
     * @param uuid UUID to validate
     * @return true if valid UUID format, false otherwise
     */
    public boolean validateUUID(String uuid) {
        if (uuid == null || uuid.trim().isEmpty()) {
            return false;
        }
        return UUID_PATTERN.matcher(uuid).matches();
    }

    /**
     * Validates email format
     * 
     * @param email Email to validate
     * @return true if valid email format, false otherwise
     */
    public boolean validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches() && email.length() <= 254;
    }

    /**
     * Validates string length
     * 
     * @param input     Input to validate
     * @param maxLength Maximum allowed length
     * @param fieldName Field name for logging
     * @return true if length is valid, false otherwise
     */
    public boolean validateLength(String input, int maxLength, String fieldName) {
        if (input == null) {
            return true; // Null is handled separately
        }
        if (input.length() > maxLength) {
            log.warn("Input exceeds maximum length in field: {}, Max: {}, Actual: {}",
                    fieldName, maxLength, input.length());
            return false;
        }
        return true;
    }

    /**
     * Validates numeric range
     * 
     * @param value     Numeric value to validate
     * @param min       Minimum allowed value
     * @param max       Maximum allowed value
     * @param fieldName Field name for logging
     * @return true if value is in range, false otherwise
     */
    public boolean validateNumericRange(Number value, Number min, Number max, String fieldName) {
        if (value == null) {
            return true; // Null is handled separately
        }
        double v = value.doubleValue();
        double minVal = min.doubleValue();
        double maxVal = max.doubleValue();

        if (v < minVal || v > maxVal) {
            log.warn("Numeric value out of range in field: {}, Range: [{}, {}], Actual: {}",
                    fieldName, minVal, maxVal, v);
            return false;
        }
        return true;
    }

    /**
     * Comprehensive validation for user input
     * 
     * @param input     User input to validate
     * @param fieldName Field name being validated
     * @param maxLength Maximum allowed length
     * @return true if all validations pass, false otherwise
     */
    public boolean validateComprehensive(String input, String fieldName, int maxLength) {
        if (input == null || input.trim().isEmpty()) {
            return true;
        }

        return validateLength(input, maxLength, fieldName) &&
                validateSQLSafety(input, fieldName) &&
                validateXSSSafety(input, fieldName) &&
                validatePathTraversal(input, fieldName);
    }

    /**
     * Masks sensitive data for logging
     * 
     * @param data Data to mask
     * @return Masked string for safe logging
     */
    private String maskSensitiveData(String data) {
        if (data == null || data.length() <= 4) {
            return "***";
        }
        return data.substring(0, 2) + "***" + data.substring(data.length() - 2);
    }
}
