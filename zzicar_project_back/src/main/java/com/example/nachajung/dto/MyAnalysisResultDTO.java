package com.example.nachajung.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MyAnalysisResultDTO {

    private Long requestId;
    private Long imageId;
    private String imagePath;

    private String brandName;
    private String modelName;
    private Integer modelYear;
    private Integer mileage;

    private BigDecimal predictedPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal confidenceScore;

    private String status;
    private LocalDateTime requestedAt;
}