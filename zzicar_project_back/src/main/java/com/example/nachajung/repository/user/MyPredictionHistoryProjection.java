package com.example.nachajung.repository.user;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface MyPredictionHistoryProjection {

    Long getPredictionId();
    Long getRequestId();

    Long getPredictedPrice();
    Long getMinPrice();
    Long getMaxPrice();

    BigDecimal getConfidenceScore();
    LocalDateTime getCreatedAt();

    String getBrandNameSnapshot();
    String getModelNameSnapshot();

    Integer getModelYear();
    Integer getMileage();

    String getResultSummary();
}