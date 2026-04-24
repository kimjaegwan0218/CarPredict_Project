package com.example.nachajung.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BaseResponse {

    private boolean success;
    private String predictedLabel;
    private String mappedName;
    private Integer manufacturer;
    private Double predictedConfidence;
    private List<Top5Item> top5;
    private Long adjustedPriceWon;
    private Integer inputYear;
    private Integer inputMileage;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Top5Item {
        private String modelName;
        private Double confidence;
    }
}