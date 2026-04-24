package com.example.nachajung.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FinalAnalysisResultDto {

    private Long requestId;
    private String status;

    private String brandName;
    private String modelName;
    private Integer modelYear;
    private Integer mileage;

    private Long basePriceWon;
    private Long depreciationAmount;
    private Long finalPriceWon;

    private String damageTypeKor;
    private Integer areaClass;

    private String resultSummary;

    private String carImagePath;
    private String damageImagePath;
}