package com.microsaas.invoice.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final ConcurrentMap<String, Bucket> cacheBuckets =
            new ConcurrentHashMap<>();

    // Authenticated users
    private static final long USER_RATE_LIMIT = 100;
    private static final long USER_RATE_LIMIT_SECONDS = 60;

    // Anonymous users
    private static final long IP_RATE_LIMIT = 20;
    private static final long IP_RATE_LIMIT_SECONDS = 60;

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) throws Exception {

        String path = request.getRequestURI();

        // Skip health & swagger endpoints
        if (path.startsWith("/actuator/health")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")) {
            return true;
        }

        String key = getClientIdentifier(request);

        Bucket bucket = cacheBuckets.computeIfAbsent(
                key,
                k -> createNewBucket(request));

        ConsumptionProbe probe =
                bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {

            response.addHeader(
                    "X-Rate-Limit-Remaining",
                    String.valueOf(probe.getRemainingTokens()));

            return true;
        }

        long waitForRefill =
                TimeUnit.NANOSECONDS.toSeconds(
                        probe.getNanosToWaitForRefill());

        response.setStatus(
                HttpStatus.TOO_MANY_REQUESTS.value());

        response.setContentType("application/json");

        response.addHeader(
                "Retry-After",
                String.valueOf(waitForRefill));

        response.getWriter().write(
                """
                {
                  "status":429,
                  "error":"Too Many Requests",
                  "message":"Rate limit exceeded. Try again later."
                }
                """);

        log.warn(
                "Rate limit exceeded for client: {}. Retry after {} seconds",
                key,
                waitForRefill);

        return false;
    }

    private String getClientIdentifier(HttpServletRequest request) {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader != null
                && authHeader.startsWith("Bearer ")) {

            // Better: extract userId from JWT
            return "user:" + authHeader.hashCode();
        }

        return "ip:" + getClientIpAddress(request);
    }

    private Bucket createNewBucket(
            HttpServletRequest request) {

        boolean isAuthenticated =
                request.getHeader("Authorization") != null;

        Bandwidth limit;

        if (isAuthenticated) {

            limit = Bandwidth.simple(
                    USER_RATE_LIMIT,
                    Duration.ofSeconds(
                            USER_RATE_LIMIT_SECONDS));

        } else {

            limit = Bandwidth.simple(
                    IP_RATE_LIMIT,
                    Duration.ofSeconds(
                            IP_RATE_LIMIT_SECONDS));
        }

        return Bucket4j.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientIpAddress(
            HttpServletRequest request) {

        String[] headers = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {

            String ip = request.getHeader(header);

            if (ip != null
                    && !ip.isEmpty()
                    && !"unknown".equalsIgnoreCase(ip)) {

                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}