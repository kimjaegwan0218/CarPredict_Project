const API_BASE = "http://localhost:8080";

export async function analyzeCar({
  userId,
  year,
  mileage,
  carImage,
  damageImages,
}) {
  const formData = new FormData();

  formData.append("userId", String(userId));
  formData.append("year", String(year));
  formData.append("mileage", String(mileage));
  formData.append("carImage", carImage);

  damageImages.forEach((file) => {
    formData.append("damageImages", file);
  });

  const response = await fetch(`${API_BASE}/api/car/analyze`, {
    method: "POST",
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || "분석 요청에 실패했습니다.");
    }

    const text = await response.text();
    throw new Error(text || "분석 요청에 실패했습니다.");
  }

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();
  throw new Error(`예상치 못한 응답 형식입니다: ${text}`);
}

export async function getBrands() {
  const response = await fetch(`${API_BASE}/api/car/brands`);
  if (!response.ok) {
    throw new Error("제조사 목록 조회에 실패했습니다.");
  }
  return await response.json();
}

export async function getModels(brandId) {
  const response = await fetch(`${API_BASE}/api/car/models?brandId=${brandId}`);
  if (!response.ok) {
    throw new Error("모델 목록 조회에 실패했습니다.");
  }
  return await response.json();
}

export async function getHistory(page = 0, size = 5) {
  const response = await fetch(`${API_BASE}/api/car/history?page=${page}&size=${size}`);
  if (!response.ok) {
    throw new Error("이력 조회에 실패했습니다.");
  }
  return await response.json();
}

export async function getResultDetail(requestId) {
  const response = await fetch(`${API_BASE}/api/car/results/${requestId}`);
  if (!response.ok) {
    throw new Error("결과 상세 조회에 실패했습니다.");
  }
  return await response.json();
}