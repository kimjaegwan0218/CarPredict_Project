package com.example.nachajung.repository;

import com.example.nachajung.dto.AnalysisReportDetailDto;
import com.example.nachajung.dto.HistoryListItemDto;
import com.example.nachajung.entity.PricePrediction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<PricePrediction, Long> {

    @Query("""
        SELECT new com.example.nachajung.dto.AnalysisReportDetailDto(
            r.requestId,
            r.status,
            u.userId,
            u.name,
            img.imageId,
            img.storedPath,
            img.uploadedAt,
            p.brandNameSnapshot,
            p.modelNameSnapshot,
            p.modelYear,
            p.mileage,
            p.basePriceWon,
            p.depreciationAmount,
            p.finalPriceWon,
            p.confidenceScore,
            d.predictedDamageTypeKor,
            d.areaClass,
            p.resultSummary,
            p.createdAt
        )
        FROM PricePrediction p
        JOIN p.request r
        JOIN r.user u
        JOIN r.image img
        JOIN DamageAnalysisResult d ON d.request.requestId = r.requestId
        WHERE r.requestId = :requestId
    """)
    Optional<AnalysisReportDetailDto> findReportDetailByRequestId(Long requestId);

    @Query("""
        SELECT new com.example.nachajung.dto.HistoryListItemDto(
            r.requestId,
            u.name,
            p.brandNameSnapshot,
            p.modelNameSnapshot,
            p.modelYear,
            p.mileage,
            p.finalPriceWon,
            r.status,
            img.storedPath,
            p.createdAt
        )
        FROM PricePrediction p
        JOIN p.request r
        JOIN r.user u
        JOIN r.image img
        ORDER BY p.createdAt DESC
    """)
    List<HistoryListItemDto> findHistoryList(Pageable pageable);


    @Query("""
    SELECT new com.example.nachajung.dto.HistoryListItemDto(
        r.requestId,
        u.name,
        p.brandNameSnapshot,
        p.modelNameSnapshot,
        p.modelYear,
        p.mileage,
        p.finalPriceWon,
        r.status,
        img.storedPath,
        p.createdAt
    )
    FROM PricePrediction p
    JOIN p.request r
    JOIN r.user u
    JOIN r.image img
    WHERE (:brandName IS NULL OR p.brandNameSnapshot = :brandName)
      AND (:modelName IS NULL OR p.modelNameSnapshot = :modelName)
    ORDER BY p.createdAt DESC
""")
    List<HistoryListItemDto> findHistoryListWithFilter(
            String brandName,
            String modelName,
            Pageable pageable
    );
}