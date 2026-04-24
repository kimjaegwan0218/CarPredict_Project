package com.example.nachajung.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.nachajung.entity.AnalysisRequest.Status;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisReportDetailDto {

    private Long requestId;
    private Status status;

    private Long userId;
    private String userName;

    private Long imageId;
    private String imagePath;
    private LocalDateTime uploadedAt;

    private String brandName;
    private String modelName;
    private Integer modelYear;
    private Integer mileage;

    private Long basePriceWon;
    private Long depreciationAmount;
    private Long finalPriceWon;
    private BigDecimal confidenceScore;

    private String damageTypeKor;
    private Integer areaClass;

    private String resultSummary;
    private LocalDateTime analyzedAt;
}