package com.microsaas.invoice.security;

import com.microsaas.invoice.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:your-secret-key-change-this-in-production-with-minimum-256-bits}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("tenantId", user.getTenantId())
                .claim("role", user.getRole().toString())
                .claim("fullName", user.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return (String) claims.get("email");
    }

    public String getTenantIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return (String) claims.get("tenantId");
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return (String) claims.get("role");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpirationTime() {
        return jwtExpirationMs;
    }

    public String getUserIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal) {
            return ((JwtUserPrincipal) authentication.getPrincipal()).getId();
        }
        return null;
    }

    public String getTenantIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal) {
            return ((JwtUserPrincipal) authentication.getPrincipal()).getTenantId();
        }
        return null;
    }
}
