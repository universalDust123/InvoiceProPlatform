package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.*;
import com.microsaas.invoice.entity.User;
import com.microsaas.invoice.exception.UnauthorizedException;
import com.microsaas.invoice.exception.ResourceNotFoundException;
import com.microsaas.invoice.repository.UserRepository;
import com.microsaas.invoice.security.JwtTokenProvider;
import com.microsaas.invoice.security.JwtUserPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Get current user from authentication context
     */
    private User getCurrentUser() {
        JwtUserPrincipal principal =
            (JwtUserPrincipal)
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication()
                            .getPrincipal();

    log.debug("Getting current user with ID: {}", principal.getId());

    return userRepository.findById(principal.getId())
            .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));
    }

    /**
     * Get user profile
     */
    public UserDTO getProfile() {
        User user = getCurrentUser();
        return buildUserDTO(user);
    }

    /**
     * Update user profile (name and email)
     */
    public UserDTO updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        // Check if email is already taken by another user
        if (!user.getEmail().equals(request.getEmail())) {
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        throw new IllegalArgumentException("Email already in use");
                    });
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        User updatedUser = userRepository.save(user);

        return buildUserDTO(updatedUser);
    }

    /**
     * Change user password
     */
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Update with new password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Get notification preferences
     */
    public NotificationPreferencesDTO getNotificationPreferences() {
        User user = getCurrentUser();

        return NotificationPreferencesDTO.builder()
                .paymentReminders(user.getNotifyPaymentReminders())
                .invoiceSentConfirmations(user.getNotifyInvoiceConfirmations())
                .weeklyReports(user.getNotifyWeeklyReports())
                .securityAlerts(user.getNotifySecurityAlerts())
                .build();
    }

    /**
     * Update notification preferences
     */
    public NotificationPreferencesDTO updateNotificationPreferences(NotificationPreferencesDTO preferences) {
        User user = getCurrentUser();

        user.setNotifyPaymentReminders(preferences.getPaymentReminders());
        user.setNotifyInvoiceConfirmations(preferences.getInvoiceSentConfirmations());
        user.setNotifyWeeklyReports(preferences.getWeeklyReports());
        user.setNotifySecurityAlerts(preferences.getSecurityAlerts());

        userRepository.save(user);

        return preferences;
    }

    /**
     * Get user preferences
     */
    public UserPreferencesDTO getUserPreferences() {
        User user = getCurrentUser();

        return UserPreferencesDTO.builder()
                .theme(user.getThemePreference())
                .build();
    }

    /**
     * Update user preferences
     */
    public UserPreferencesDTO updateUserPreferences(UserPreferencesDTO preferences) {
        User user = getCurrentUser();

        user.setThemePreference(preferences.getTheme());
        userRepository.save(user);

        return preferences;
    }

    /**
     * Delete user account
     */
    public void deleteAccount() {
        User user = getCurrentUser();
        userRepository.delete(user);
    }

    /**
     * Build UserDTO from User entity
     */
    private UserDTO buildUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .tenantId(user.getTenantId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
