package com.example.nachajung.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "classification_results")
@Getter
@Setter
public class ClassificationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long classificationId;

    @OneToOne
    @JoinColumn(name = "request_id", nullable = false)
    private AnalysisRequest request;

    @ManyToOne
    @JoinColumn(name = "predicted_brand_id")
    private VehicleBrand predictedBrand;

    @ManyToOne
    @JoinColumn(name = "predicted_model_id")
    private VehicleModel predictedModel;

    @Column(name = "predicted_label", nullable = false, length = 255)
    private String predictedLabel;

    @Column(name = "mapped_name", length = 255)
    private String mappedName;

    @Column(name = "manufacturer_code")
    private Integer manufacturerCode;

    @Column(name = "manufacturer_name", length = 100)
    private String manufacturerName;

    @Column(name = "confidence", nullable = false, precision = 8, scale = 6)
    private BigDecimal confidence;

    @Column(name = "top_k_json", columnDefinition = "LONGTEXT")
    private String topKJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}