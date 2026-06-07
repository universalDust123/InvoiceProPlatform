package com.microsaas.invoice.service;

import com.microsaas.invoice.dto.LoginRequest;
import com.microsaas.invoice.dto.RegisterRequest;
import com.microsaas.invoice.dto.AuthResponse;
import com.microsaas.invoice.dto.UserDTO;
import com.microsaas.invoice.entity.User;
import com.microsaas.invoice.entity.UserRole;
import com.microsaas.invoice.exception.UnauthorizedException;
import com.microsaas.invoice.repository.UserRepository;
import com.microsaas.invoice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ADMIN)
                .tenantId(request.getTenantId())
                .build();

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndTenantId(request.getEmail(), request.getTenantId())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user);
        long expiresIn = jwtTokenProvider.getExpirationTime();

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .tenantId(user.getTenantId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(userDTO)
                .build();
    }
}
