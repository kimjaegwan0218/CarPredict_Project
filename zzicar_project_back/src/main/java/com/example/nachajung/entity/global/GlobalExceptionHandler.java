package com.example.nachajung.entity.global;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> body = new HashMap<>();

        FieldError fieldError = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .orElse(null);

        body.put("message", fieldError != null ? fieldError.getDefaultMessage() : "입력값이 올바르지 않습니다.");
        body.put("errorType", e.getClass().getName());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ErrorResponseException e) {
        Map<String, String> body = new HashMap<>();
        body.put("message", e.getBody().getDetail());
        body.put("errorType", e.getClass().getName());
        return ResponseEntity.status(e.getStatusCode()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleEtc(Exception e) {
        Map<String, String> body = new HashMap<>();
        body.put("message", e.getMessage() != null ? e.getMessage() : "서버 내부 오류가 발생했습니다.");
        body.put("errorType", e.getClass().getName());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}