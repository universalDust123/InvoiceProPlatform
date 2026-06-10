package com.microsaas.invoice.config;

import com.microsaas.invoice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// import java.beans.Customizer;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Enhanced Security Configuration for API Protection
 * - JWT-based authentication
 * - CORS with restricted origins
 * - Stateless session management
 * - Role-based access control
 * - Security headers
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:3001,http://frontend:3000,https://invoice-pro-platform.vercel.app/}")
    private String allowedOrigins;

    @Value("${app.swagger.enabled:false}")
    private boolean swaggerEnabled;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Increased strength to 12 rounds
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF Protection - Disabled for stateless JWT APIs
                .csrf(csrf -> csrf.disable())

                // CORS Configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless session management for JWT
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Security Headers
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self'"))
                        .frameOptions(frame -> frame.sameOrigin())
                        .contentTypeOptions(Customizer.withDefaults()))

                // Authorization Rules
                .authorizeHttpRequests(authz -> {
                    // Public endpoints
                    authz.requestMatchers(
                            "/api/auth/login",
                            "/api/auth/register",
                            "/api/auth/refresh").permitAll();

                    authz.requestMatchers("/actuator/health").permitAll();

                    // Swagger endpoints
                    if (swaggerEnabled) {
                        authz.requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**").permitAll();
                    } else {
                        authz.requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**").denyAll();
                    }

                    // All API endpoints require authentication
                    authz.requestMatchers("/api/**").authenticated();

                    // Deny everything else
                    authz.anyRequest().denyAll();
                })

                // Exception Handling
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                new org.springframework.security.web.authentication.Http403ForbiddenEntryPoint()))

                // Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .toList());

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"));

        configuration.setExposedHeaders(List.of(
                "Authorization",
                "X-Total-Count",
                "X-Page-Number"));

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
