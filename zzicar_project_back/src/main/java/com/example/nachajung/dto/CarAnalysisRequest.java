package com.example.nachajung.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarAnalysisRequest {
    private List<String> images; // 리액트에서 보낸 6장의 이미지 Base64 데이터 배열
}