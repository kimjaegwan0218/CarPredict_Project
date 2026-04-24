import React from "react";
import "./AnalysisResultCard.css";

function formatWon(value) {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString()}원`;
}

function AnalysisResultCard({ resultData }) {
  if (!resultData) return null;

  const API_BASE = "http://localhost:8080";
  const imageUrl = resultData.carImagePath
    ? `${API_BASE}${resultData.carImagePath}`
    : null;

  return (
    <div className="result-card-wrap">
      <h1 className="result-title">중고차 감가 분석 결과</h1>

      <div className="result-card">
        {imageUrl && (
          <div className="result-image-box">
            <img src={imageUrl} alt="업로드한 차량 이미지" />
          </div>
        )}

        <div className="result-section">
          <div className="result-badge">분석 완료</div>
          <h2 className="vehicle-name">
            {resultData.brandName} {resultData.modelName}
          </h2>
          <p className="vehicle-meta">
            {resultData.modelYear}년식 | {Number(resultData.mileage).toLocaleString()}km
          </p>
        </div>

        <div className="result-section">
          <h3 className="section-title">파손 분석</h3>
          <div className="result-row">
            <span>파손 유형</span>
            <strong>{resultData.damageTypeKor}</strong>
          </div>
          <div className="result-row">
            <span>면적 클래스</span>
            <strong>{resultData.areaClass}</strong>
          </div>
        </div>

        <div className="result-section">
          <h3 className="section-title">가격 정보</h3>
          <div className="result-row">
            <span>기본 시세</span>
            <strong>{formatWon(resultData.basePriceWon)}</strong>
          </div>
          <div className="result-row minus">
            <span>감가 예상액</span>
            <strong>- {formatWon(resultData.depreciationAmount)}</strong>
          </div>
          <div className="result-row final">
            <span>최종 예상가</span>
            <strong>{formatWon(resultData.finalPriceWon)}</strong>
          </div>
        </div>

        <div className="result-section">
          <h3 className="section-title">요약</h3>
          <p className="summary-text">{resultData.resultSummary}</p>
        </div>
      </div>
    </div>
  );
}

export default AnalysisResultCard;