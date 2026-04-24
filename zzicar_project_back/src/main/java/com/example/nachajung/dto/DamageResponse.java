package com.example.nachajung.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DamageResponse {

    private boolean success;
    private String predictedDamageType;
    private String predictedDamageTypeKor;
    private Double predictedConfidence;
    private Integer areaClass;
    private Double depreciationRate;
    private Long depreciationAmount;
}