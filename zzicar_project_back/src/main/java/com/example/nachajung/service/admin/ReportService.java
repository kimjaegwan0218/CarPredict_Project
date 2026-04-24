package com.example.nachajung.service.admin;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    public Map<String, Object> analyzeCarDamage(List<String> images) {
        // 1. 나중에 여기서 파이썬 Flask 서버나 FastAPI 서버로 images를 쏴줄 거야.
        // 2. 지금은 통신 확인을 위해 가짜(Mock) 데이터를 만들어서 반환하자.

        Map<String, Object> result = new HashMap<>();

        // 차량 기본 정보
        Map<String, Object> vehicle = new HashMap<>();
        vehicle.put("modelName", "현대 올 뉴 투싼");
        vehicle.put("year", "2019년식");
        vehicle.put("fuel", "가솔린");
        vehicle.put("mileage", "28,427km");
        vehicle.put("number", "123가 4567");
        result.put("vehicle", vehicle);

        // 파손 상세 내역 (리액트가 기대하는 형식)
        List<Map<String, Object>> damageList = new ArrayList<>();

        Map<String, Object> d1 = new HashMap<>();
        d1.put("part", "운전석 도어");
        d1.put("type", "깊은 스크래치");
        d1.put("severity", 2);
        d1.put("loss", "-20,000");
        d1.put("confidence", 88);
        d1.put("status", "warning");
        damageList.add(d1);

        result.put("damage", damageList);
        result.put("basePrice", 19700000);
        result.put("damageGrade", 6);
        result.put("gradeStatus", "상위 60% 평균 상태");
        result.put("gradeMessage", "AI 분석 결과 통계적 B- 등급입니다.");

        return result;

// 하단의 소스는 상단의 소스를 지웠을때 적용! 상단의 소스 테스트 완료!!

//        public Map<String, Object> analyzeCarDamage(List<String> images) {
//            Map<String, Object> result = new HashMap<>();
//
//            // 1. AI 모델에게 분석 요청 (여기서 진짜 분석이 일어남)
//            // AIResponse aiResult = aiModelService.predict(images);
//
//            // 2. 모델이 알려준 결과를 바구니에 담기
//            Map<String, Object> vehicle = new HashMap<>();
//            vehicle.put("modelName", aiResult.getModelName()); // 모델이 찾은 차종
//            vehicle.put("mileage", aiResult.getMileage());     // 모델이 읽은 주행거리
//
//            result.put("vehicle", vehicle);
//            // ... 나머지 파손 부위도 AI가 찾은 데이터로 채움
//
//            return result;
//        }
    }
}