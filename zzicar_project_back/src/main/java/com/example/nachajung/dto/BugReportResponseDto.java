package com.example.nachajung.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BugReportResponseDto {

    private Long requestId;
    private Long userId;
    private String userName;
    private String email;
    private Long imageId;
    private String originalFilename;
    private String status;
    private String errorMessage;
    private LocalDateTime requestedAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
