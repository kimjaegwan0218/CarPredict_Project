package com.example.nachajung.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "damage_analysis_results")
@Getter
@Setter
public class DamageAnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long damageAnalysisId;

    @OneToOne
    @JoinColumn(name = "request_id", nullable = false)
    private AnalysisRequest request;

    @Column(name = "predicted_damage_type", nullable = false, length = 100)
    private String predictedDamageType;

    @Column(name = "predicted_damage_type_kor", length = 100)
    private String predictedDamageTypeKor;

    @Column(name = "predicted_confidence", nullable = false, precision = 8, scale = 6)
    private BigDecimal predictedConfidence;

    @Column(name = "area_class")
    private Integer areaClass;

    @Column(name = "depreciation_rate", precision = 10, scale = 6)
    private BigDecimal depreciationRate;

    @Column(name = "depreciation_amount", nullable = false)
    private Long depreciationAmount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}