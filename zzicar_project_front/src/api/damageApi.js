// src/api/damageApi.js

// 1. URL 변수를 함수 밖(맨 위)에 정확히 선언해줘야 해!
const API_BASE_URL = "http://localhost:8080"; 

/**
 * AI 서버로 이미지를 전송하여 파손 분석 결과를 받아오는 함수
 */
export const analyzeDamage = async (images) => { // 2. 여기서 images를 인자로 받아야 함!
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images }), // 3. 위에서 받은 images를 여기서 사용
    });

    if (!response.ok) {
      throw new Error("서버 응답에 문제가 발생했습니다.");
    }

    // 서버에서 준 JSON 데이터를 결과로 반환
    const result = await response.json(); 
    return result;

  } catch (error) {
    console.error("AI 분석 중 오류 발생:", error);
    throw error;
  }
};