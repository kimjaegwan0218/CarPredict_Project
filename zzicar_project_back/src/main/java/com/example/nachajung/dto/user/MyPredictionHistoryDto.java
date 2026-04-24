package com.example.nachajung.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPredictionHistoryDto {

    private Long predictionId;
    private Long requestId;

    private Long predictedPrice;
    private Long minPrice;
    private Long maxPrice;

    private BigDecimal confidenceScore;
    private LocalDateTime createdAt;

    private String brandNameSnapshot;
    private String modelNameSnapshot;

    private Integer modelYear;
    private Integer mileage;

    private String resultSummary;
}