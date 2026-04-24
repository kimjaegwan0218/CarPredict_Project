package com.example.nachajung.service.user;

import com.example.nachajung.dto.user.MyPredictionHistoryDto;
import com.example.nachajung.repository.user.MyPredictionHistoryProjection;
import com.example.nachajung.repository.user.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyPageService {

    private final PredictionRepository predictionRepository;

    public List<MyPredictionHistoryDto> getMyPredictionHistory(Long userId) {

        List<MyPredictionHistoryProjection> rows =
                predictionRepository.findMyPredictionHistory(userId);

        return rows.stream()
                .map(row -> MyPredictionHistoryDto.builder()
                        .predictionId(row.getPredictionId())
                        .requestId(row.getRequestId())
                        .predictedPrice(row.getPredictedPrice())
                        .minPrice(row.getMinPrice())
                        .maxPrice(row.getMaxPrice())
                        .confidenceScore(row.getConfidenceScore())
                        .createdAt(row.getCreatedAt())
                        .brandNameSnapshot(row.getBrandNameSnapshot())
                        .modelNameSnapshot(row.getModelNameSnapshot())
                        .modelYear(row.getModelYear())
                        .mileage(row.getMileage())
                        .resultSummary(row.getResultSummary())
                        .build()
                )
                .toList();
    }
}