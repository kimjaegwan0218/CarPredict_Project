import React, { useState } from 'react';
import './MainHistory.css'; 

const MainHistory = () => {
  // 1. 프론트엔드용 가상 정비 내역 데이터 (Mock Data)
  const [historyData] = useState([
    {
      id: 1,
      date: "2025. 10. 15",
      part: "앞 범퍼",
      type: "판금/도색",
      cost: 350000,
      centerName: "블루핸즈 강남점",
      description: "주차 중 기둥 접촉으로 인한 찌그러짐 복구"
    },
    {
      id: 2,
      date: "2024. 05. 02",
      part: "운전석 도어",
      type: "단순 도색 (스크래치)",
      cost: 150000,
      centerName: "스피드메이트 서초점",
      description: "문콕으로 인한 스크래치 제거 및 도색"
    },
    {
      id: 3,
      date: "2023. 11. 20",
      part: "왼쪽 휀다",
      type: "부품 교체",
      cost: 550000,
      centerName: "현대자동차 직영 서비스센터",
      description: "측면 충돌로 인한 휀다 파손 교체 (보험 처리)"
    }
  ]);

  // 총 누적 수리비 자동 계산 로직
  const totalCost = historyData.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="maintenance-container">
      {/* 상단 대시보드 */}
      <div className="history-summary-card">
        <h3>내 차 정비 요약</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">총 누적 수리비</span>
            <span className="value text-red">{totalCost.toLocaleString()}원</span>
          </div>
          <div className="summary-item">
            <span className="label">정비 건수</span>
            <span className="value">{historyData.length}건</span>
          </div>
        </div>
      </div>

      {/* 타임라인 영역 */}
      <div className="history-timeline">
        <h3>과거 수리 내역</h3>
        {historyData.map((record) => (
          <div key={record.id} className="timeline-item">
            <div className="timeline-date">{record.date}</div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="part-badge">{record.part}</span>
                <span className="cost">-{record.cost.toLocaleString()}원</span>
              </div>
              <h4 className="type">{record.type}</h4>
              <p className="description">{record.description}</p>
              <span className="center-name">{record.centerName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainHistory;