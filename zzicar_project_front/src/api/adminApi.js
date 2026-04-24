const ADMIN_API_BASE = 'http://localhost:8080/api/admin';
const CAR_API_BASE = 'http://localhost:8080/api/car';

export async function getBugReports() {
  const response = await fetch(`${ADMIN_API_BASE}/bug-reports`);

  if (!response.ok) {
    throw new Error('버그 리포트 조회 실패');
  }

  return await response.json();
}

export async function getAdminAnalysisCards(page = 0, size = 20) {
  const response = await fetch(
    `${CAR_API_BASE}/history?page=${page}&size=${size}`
  );

  if (!response.ok) {
    throw new Error('관리자 분석 결과 조회 실패');
  }

  return await response.json();
}