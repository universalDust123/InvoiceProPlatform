package com.microsaas.invoice.controller;

import com.microsaas.invoice.dto.*;
import com.microsaas.invoice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserDTO> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update user profile")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change user password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notification preferences")
    public ResponseEntity<NotificationPreferencesDTO> getNotificationPreferences() {
        return ResponseEntity.ok(userService.getNotificationPreferences());
    }

    @PutMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update notification preferences")
    public ResponseEntity<NotificationPreferencesDTO> updateNotificationPreferences(
            @Valid @RequestBody NotificationPreferencesDTO preferences) {
        return ResponseEntity.ok(userService.updateNotificationPreferences(preferences));
    }

    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user preferences")
    public ResponseEntity<UserPreferencesDTO> getUserPreferences() {
        return ResponseEntity.ok(userService.getUserPreferences());
    }

    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update user preferences")
    public ResponseEntity<UserPreferencesDTO> updateUserPreferences(
            @Valid @RequestBody UserPreferencesDTO preferences) {
        return ResponseEntity.ok(userService.updateUserPreferences(preferences));
    }

    @DeleteMapping("/account")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete user account")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.noContent().build();
    }
}
