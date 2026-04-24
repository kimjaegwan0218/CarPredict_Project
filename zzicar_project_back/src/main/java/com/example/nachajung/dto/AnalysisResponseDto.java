package com.example.nachajung.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalysisResponseDto {
    private Long requestId;
    private String status;
    private String storedPath; // 리액트에서 사진 보여줄 때 필요
}