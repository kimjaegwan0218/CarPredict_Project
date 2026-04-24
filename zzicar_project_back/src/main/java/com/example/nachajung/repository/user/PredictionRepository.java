package com.example.nachajung.repository.user;

import com.example.nachajung.entity.PricePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PredictionRepository extends JpaRepository<PricePrediction, Long> {

    @Query(value = """
        select
            p.prediction_id as predictionId,
            r.request_id as requestId,
            p.final_price_won as predictedPrice,
            p.min_price as minPrice,
            p.max_price as maxPrice,
            p.confidence_score as confidenceScore,
            p.created_at as createdAt,
            p.brand_name_snapshot as brandNameSnapshot,
            p.model_name_snapshot as modelNameSnapshot,
            p.model_year as modelYear,
            p.mileage as mileage,
            p.result_summary as resultSummary
        from price_predictions p
        join analysis_requests r on p.request_id = r.request_id
        where r.user_id = :userId
          and r.status = 'DONE'
        order by p.created_at desc
        """, nativeQuery = true)
    List<MyPredictionHistoryProjection> findMyPredictionHistory(@Param("userId") Long userId);
}