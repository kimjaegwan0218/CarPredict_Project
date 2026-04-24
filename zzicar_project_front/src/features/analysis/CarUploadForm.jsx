import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeCar } from "../../api/analysis";
import "./CarUploadForm.css";

function CarUploadForm() {
  const navigate = useNavigate();

  const damageParts = [
    { id: "front", label: "전면부" },
    { id: "driver-front", label: "운전석 앞쪽" },
    { id: "passenger-front", label: "조수석 앞쪽" },
    { id: "rear", label: "후면부" },
    { id: "driver-rear", label: "운전석 뒤쪽" },
    { id: "passenger-rear", label: "조수석 뒤쪽" },
  ];

  const carImageInputRef = useRef(null);

  const [userId, setUserId] = useState("1");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");

  const [carImage, setCarImage] = useState(null);
  const [carPreview, setCarPreview] = useState("");

  const [damageImages, setDamageImages] = useState({});
  const [damagePreviews, setDamagePreviews] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCarImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCarImage(file);
    setCarPreview(URL.createObjectURL(file));
  };

  const handleDamageImageChange = (e, partId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDamageImages((prev) => ({
      ...prev,
      [partId]: file,
    }));

    setDamagePreviews((prev) => ({
      ...prev,
      [partId]: URL.createObjectURL(file),
    }));
  };

  const validateForm = () => {
    const damageFileList = Object.values(damageImages);

    if (!userId) {
      alert("사용자 ID를 입력해 주세요.");
      return false;
    }

    if (!carImage) {
      alert("대표 차량 사진 1장을 업로드해 주세요.");
      return false;
    }

    if (damageFileList.length === 0) {
      alert("파손 사진을 최소 1장 업로드해 주세요.");
      return false;
    }

    if (damageFileList.length > 6) {
      alert("파손 사진은 최대 6장까지 가능합니다.");
      return false;
    }

    if (!year) {
      alert("연식을 입력해 주세요.");
      return false;
    }

    if (!mileage) {
      alert("주행거리를 입력해 주세요.");
      return false;
    }

    return true;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const result = await analyzeCar({
        userId: Number(userId),
        year: Number(year),
        mileage: Number(mileage),
        carImage,
        damageImages: Object.values(damageImages),
      });

      navigate("/result", {
        state: {
          resultData: result,
        },
      });
    } catch (err) {
      setError(err.message || "분석 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h2 className="upload-title">차량 감가 분석 요청</h2>
      <p className="upload-subtitle">
        대표 차량 사진 1장과 파손 사진을 업로드한 뒤 분석을 시작해 주세요.
      </p>

      <div className="input-group">
        <label className="input-label">사용자 ID</label>
        <input
          type="number"
          className="text-input"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="예) 1"
        />
      </div>

      <div className="input-group">
        <label className="input-label">대표 차량 사진</label>
        <div
          className="car-image-box"
          onClick={() => carImageInputRef.current?.click()}
        >
          {carPreview ? (
            <img
              src={carPreview}
              alt="대표 차량"
              className="car-main-preview"
            />
          ) : (
            <span className="car-image-placeholder">차량 대표 사진 추가</span>
          )}
        </div>

        <input
          ref={carImageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleCarImageChange}
        />
      </div>

      <div className="photo-list">
        {damageParts.map((part) => (
          <div key={part.id}>
            <div
              className="photo-item"
              onClick={() =>
                document.getElementById(`damage-${part.id}`)?.click()
              }
            >
              <span className="photo-label">
                {damagePreviews[part.id] ? "✅ " : "+ "} {part.label}
              </span>

              {damagePreviews[part.id] ? (
                <img
                  src={damagePreviews[part.id]}
                  alt={part.label}
                  className="mini-preview"
                />
              ) : (
                <span className="photo-status">추가</span>
              )}
            </div>

            <input
              id={`damage-${part.id}`}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleDamageImageChange(e, part.id)}
            />
          </div>
        ))}
      </div>

      <div className="input-group">
        <label className="input-label">연식</label>
        <input
          type="number"
          className="text-input"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="예) 2021"
        />
      </div>

      <div className="input-group">
        <label className="input-label">주행거리</label>
        <div className="mileage-input-wrapper">
          <input
            type="number"
            className="text-input mileage-input"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="예) 80300"
          />
          <span className="mileage-unit">km</span>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <button
        className="socar-btn"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "분석 중..." : "감가 예측 시작하기"}
      </button>
    </div>
  );
}

export default CarUploadForm;