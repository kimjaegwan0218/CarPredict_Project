package com.example.nachajung.controller;

import com.example.nachajung.dto.CarAnalysisRequest;
import com.example.nachajung.service.admin.ReportService; // 🌟 서비스 임포트 확인
import org.springframework.beans.factory.annotation.Autowired; // 🌟 Autowired 임포트
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReportController {

    // 🌟 서비스와 컨트롤러를 연결하는 핵심 고리!
    @Autowired
    private ReportService reportService;

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictDamage(@RequestBody CarAnalysisRequest request) {
        // 1. 리액트에서 보낸 이미지 개수 로깅 (확인용)
        if (request.getImages() != null) {
            System.out.println("백엔드 수신 이미지 개수: " + request.getImages().size());
        }

        // 2. 서비스 호출: 서비스에 만든 analyzeCarDamage 메서드를 실행하고 결과(Map)를 받음
        Map<String, Object> result = reportService.analyzeCarDamage(request.getImages());

        // 3. 리액트로 최종 결과값 반환
        return ResponseEntity.ok(result);
    }
}