import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getResultDetail } from "../api/analysis";
import AnalysisResultCard from "../features/analysis/AnalysisResultCard";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [resultData, setResultData] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resultData) return;

    if (id) {
      fetchResult(id);
    }
  }, [id]);

  const fetchResult = async (requestId) => {
    try {
      setLoading(true);
      setError("");

      const data = await getResultDetail(requestId);

      const mapped = {
        requestId: data.requestId,
        status: data.status,
        brandName: data.brandName,
        modelName: data.modelName,
        modelYear: data.modelYear,
        mileage: data.mileage,
        basePriceWon: data.basePriceWon,
        depreciationAmount: data.depreciationAmount,
        finalPriceWon: data.finalPriceWon,
        damageTypeKor: data.damageTypeKor,
        areaClass: data.areaClass,
        resultSummary: data.resultSummary,
        carImagePath: data.imagePath,
      };

      setResultData(mapped);
    } catch (err) {
      console.error("결과 상세 조회 실패:", err);
      setError(err.message || "결과를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>결과를 불러오는 중입니다...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>{error}</h2>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "12px",
            background: "#00c7fe",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>결과 데이터가 없습니다.</h2>
        <button
          onClick={() => navigate("/upload")}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "12px",
            background: "#00c7fe",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          업로드 페이지로 이동
        </button>
      </div>
    );
  }

  return <AnalysisResultCard resultData={resultData} />;
}

export default ResultPage;