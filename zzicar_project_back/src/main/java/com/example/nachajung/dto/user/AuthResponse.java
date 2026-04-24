package com.example.nachajung.dto.user;

import com.example.nachajung.entity.User;

public record AuthResponse(Long userId,
                           String name,
                           String email,
                           String role
) {
    public static AuthResponse from(User user) {
        return new AuthResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}