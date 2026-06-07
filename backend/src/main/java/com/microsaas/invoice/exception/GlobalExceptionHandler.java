package com.microsaas.invoice.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.NOT_FOUND.value())
                                .error("Not Found")
                                .message(ex.getMessage())
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .error("Unauthorized")
                                .message(ex.getMessage())
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(InvalidOperationException.class)
        public ResponseEntity<ErrorResponse> handleInvalidOperation(InvalidOperationException ex, WebRequest request) {
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Bad Request")
                                .message(ex.getMessage())
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @Override
        protected ResponseEntity<Object> handleMethodArgumentNotValid(@NotNull MethodArgumentNotValidException ex,
                        @NotNull HttpHeaders headers, @NotNull HttpStatusCode status, @NotNull WebRequest request) {
                String errors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Validation Error")
                                .message(errors)
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error("Internal Server Error")
                                .message(ex.getMessage())
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
