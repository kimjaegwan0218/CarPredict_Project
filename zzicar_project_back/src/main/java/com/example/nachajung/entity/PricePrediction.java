package com.example.nachajung.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_predictions")
@Getter
@Setter
public class PricePrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictionId;

    @OneToOne
    @JoinColumn(name = "request_id", nullable = false)
    private AnalysisRequest request;

    @Column(name = "base_price_won", nullable = false)
    private Long basePriceWon;

    @Column(name = "depreciation_amount", nullable = false)
    private Long depreciationAmount;

    @Column(name = "final_price_won", nullable = false)
    private Long finalPriceWon;

    @Column(name = "min_price")
    private Long minPrice;

    @Column(name = "max_price")
    private Long maxPrice;

    @Column(name = "confidence_score", precision = 8, scale = 6)
    private BigDecimal confidenceScore;

    @Column(name = "brand_name_snapshot", nullable = false, length = 100)
    private String brandNameSnapshot;

    @Column(name = "model_name_snapshot", nullable = false, length = 100)
    private String modelNameSnapshot;

    @Column(name = "model_year", nullable = false)
    private Integer modelYear;

    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    @Column(name = "result_summary", length = 500)
    private String resultSummary;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}