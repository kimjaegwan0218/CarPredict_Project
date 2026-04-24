import React, { useState } from 'react'; // 🌟 useState 추가 확인
import './AnalysisResult.css';
import MainHistory from './MainHistory'; // 🌟 컴포넌트 import 확인

const AnalysisResult = ({ images, data, onReset }) => {
  // 1. 정비 내역을 보여줄지 말지 결정하는 상태 (기본값: false)
  const [showHistory, setShowHistory] = useState(false);

  if (!data) return <div className="loading-text">데이터를 불러오는 중입니다...</div>;

  const { vehicle, damage, basePrice, damageGrade, gradeStatus, gradeMessage } = data;

  const getGradeColor = (grade) => {
    if (grade <= 3) return "#00c8ff"; // 양호
    if (grade <= 7) return "#ffcc00"; // 보통
    return "#ff4d4f"; // 주의
  };

  const statusColor = getGradeColor(damageGrade);
  const totalLoss = damage.reduce((acc, cur) => acc + parseInt(cur.loss.replace(/,/g, '')), 0);
  const finalPrice = basePrice + totalLoss;

  return (
    <div className="result-container">
      <h2 className="result-title">중고차 감가 예측 리포트</h2>
      
      {/* 🏅 파손 등급 카드 */}
      <div className="grade-card" style={{ borderTop: `6px solid ${statusColor}` }}>
        <div className="grade-header">
          <span className="grade-label">통계 기반 파손 등급</span>
          <span className="grade-number">{damageGrade}<span>/10</span></span>
        </div>
        <div className="grade-visual-area">
          <div className="grade-bar-bg">
            <div 
              className="grade-bar-fill" 
              style={{ width: `${damageGrade * 10}%`, backgroundColor: statusColor }}
            ></div>
          </div>
          <div className="grade-markers">
            <span>양호</span>
            <span>보통</span>
            <span>주의</span>
          </div>
        </div>
        <p className="grade-desc">
          현재 차량은 <strong>{gradeStatus}</strong> 상태입니다.<br/>
          {gradeMessage}
        </p>
      </div>

      {/* 🚗 차량 정보 요약 */}
      <div className="vehicle-info-card">
        <div className="vehicle-header">
          <span className="car-badge">검수 완료</span>
          <h3 className="car-name">{vehicle.modelName}</h3>
        </div>
        <div className="vehicle-specs">
          <span>{vehicle.year}</span> | <span>{vehicle.fuel}</span> | <span>{vehicle.mileage}</span>
          <p className="car-number">{vehicle.number}</p>
        </div>
      </div>

      {/* 🌟 부위별 파손 및 심각도 상세 내역 */}
      <div className="result-card">
        <h4 className="section-subtitle">부위별 파손 및 심각도</h4>
        {damage.map((item, idx) => (
          <div key={idx} className="analysis-item">
            <div className="item-info">
              <div className="part-info-group">
                <span className="part-name">{item.part}</span>
                <span className={`severity-badge level-${item.severity}`}>
                  심각도 {item.severity}단계
                </span>
              </div>
              <div className="damage-info">
                <span className="damage-type">{item.type}</span>
                <span className="loss-amount">{item.loss}원</span>
              </div>
            </div>
            <div className="progress-bg">
              <div 
                className={`progress-bar ${item.status}`} 
                style={{ width: `${item.confidence}%` }}
              ></div>
            </div>
            <span className="confidence-text">AI 분석 정확도: {item.confidence}%</span>
          </div>
        ))}
      </div>

      {/* 💰 최종 금액 요약 */}
      <div className="summary-box">
        <div className="summary-item">
          <span>차량 기준 가액</span>
          <span>{basePrice.toLocaleString()}원</span>
        </div>
        <div className="summary-item loss">
          <span>총 감가 예상액</span>
          <span>{totalLoss.toLocaleString()}원</span>
        </div>
        <hr className="divider" />
        <div className="summary-item total">
          <span>최종 매입 예측가</span>
          <span className="final-price">{(finalPrice / 10000).toFixed(0)}만 원</span>
        </div>
      </div>

      {/* 🌟 수정된 버튼: 클릭 시 showHistory 상태를 반전시킴 */}
      <div className="result-footer" style={{ marginTop: '20px', marginBottom: '10px' }}>
        <button 
          className="history-toggle-btn" 
          onClick={() => setShowHistory(!showHistory)} 
        >
          {showHistory ? "정비 내역 닫기 ▲" : "과거 정비 내역 확인하기 (Mint) ▼"}
        </button>
      </div>

      {/* 2. 조건부 렌더링: showHistory가 true일 때만 MainHistory 컴포넌트를 보여줌 */}
      {showHistory && <MainHistory />}

      <button className="reset-btn" onClick={onReset} style={{ marginTop: '20px' }}>
        새로운 차량 검사하기
      </button>
    </div>
  );
};

export default AnalysisResult;