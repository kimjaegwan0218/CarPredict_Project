package com.example.nachajung.dto;

import com.example.nachajung.entity.AnalysisRequest.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryListItemDto {

    private Long requestId;
    private String userName;

    private String brandName;
    private String modelName;

    private Integer modelYear;
    private Integer mileage;

    private Long finalPriceWon;
    private Status status;

    private String imagePath;
    private LocalDateTime analyzedAt;
}