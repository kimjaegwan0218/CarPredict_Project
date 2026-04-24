import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getBrands, getModels } from '../api/analysis';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const [brandList, setBrandList] = useState([]);
  const [modelList, setModelList] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 제조사 목록
  useEffect(() => {
    fetchBrandList();
  }, []);

  // 제조사 바뀌면 모델 목록
  useEffect(() => {
    if (selectedBrand?.brandId) {
      fetchModelList(selectedBrand.brandId);
    } else {
      setModelList([]);
      setSelectedModel(null);
    }
  }, [selectedBrand]);

  // 이력 목록
  useEffect(() => {
    fetchHistoryList();
  }, [page, selectedBrand, selectedModel]);

  const fetchBrandList = async () => {
    try {
      const data = await getBrands();
      setBrandList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('제조사 목록 조회 실패:', err);
    }
  };

  const fetchModelList = async (brandId) => {
    try {
      const data = await getModels(brandId);
      setModelList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('모델 목록 조회 실패:', err);
      setModelList([]);
    }
  };

  const fetchHistoryList = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getHistory(page, size);

      let list = Array.isArray(data) ? data : [];

      // 현재 백엔드는 1차 버전이라 프론트에서 snapshot 문자열로 필터
      if (selectedBrand?.brandName) {
        list = list.filter(
          (item) =>
            item.brandName &&
            item.brandName.includes(selectedBrand.brandName)
        );
      }

      if (selectedModel?.modelName) {
        list = list.filter(
          (item) =>
            item.modelName &&
            item.modelName.includes(selectedModel.modelName)
        );
      }

      setHistory(list);
    } catch (err) {
      console.error('이력 조회 실패:', err);
      setError(err.message || '이력 조회에 실패했습니다.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '날짜 미상';
    return dateTime.split('T')[0];
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '-';
    return `${Number(value).toLocaleString()}원`;
  };

  return (
    <div className="home-container">
      {/* 상단 서비스 소개 */}
      <section
        style={{
          background: '#f5f5f5',
          borderRadius: '36px',
          minHeight: '430px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          padding: '40px 20px',
          marginBottom: '30px',
        }}
      >
        <h2
          style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#111',
            marginBottom: '20px',
            letterSpacing: '-1px',
          }}
        >
          중고차 감가 분석 서비스
        </h2>

        <p
          style={{
            fontSize: '26px',
            color: '#666',
            lineHeight: '1.7',
            marginBottom: '36px',
            maxWidth: '760px',
            wordBreak: 'keep-all',
          }}
        >
          차량 사진과 파손 사진을 업로드하고 감가 분석 결과를 확인해 보세요.
        </p>

        <button
          onClick={() => navigate('/upload')}
          style={{
            backgroundColor: '#16c1f3',
            color: '#fff',
            border: 'none',
            borderRadius: '18px',
            padding: '18px 34px',
            fontSize: '28px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(22, 193, 243, 0.25)',
          }}
        >
          분석 시작하기
        </button>
      </section>

      {/* 메인 홈 기능 영역 */}
      <section className="filter-section">
        <h2 className="main-title">브랜드와 모델로 분석 이력 조회</h2>

        <div className="encar-filter-wrapper">
          {/* 제조사 */}
          <div className="filter-box">
            <div className="filter-header">제조사</div>
            <ul className="filter-list">
              <li
                className={!selectedBrand ? 'active' : ''}
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedModel(null);
                  setPage(0);
                }}
              >
                전체
              </li>

              {brandList.map((brand) => (
                <li
                  key={brand.brandId}
                  className={selectedBrand?.brandId === brand.brandId ? 'active' : ''}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setSelectedModel(null);
                    setPage(0);
                  }}
                >
                  {brand.brandName}
                </li>
              ))}
            </ul>
          </div>

          {/* 모델 */}
          <div className="filter-box">
            <div className="filter-header">모델</div>
            <ul className="filter-list">
              <li
                className={!selectedModel ? 'active' : ''}
                onClick={() => {
                  setSelectedModel(null);
                  setPage(0);
                }}
              >
                전체
              </li>

              {selectedBrand ? (
                modelList.length > 0 ? (
                  modelList.map((model) => (
                    <li
                      key={model.modelId}
                      className={selectedModel?.modelId === model.modelId ? 'active' : ''}
                      onClick={() => {
                        setSelectedModel(model);
                        setPage(0);
                      }}
                    >
                      {model.modelName}
                    </li>
                  ))
                ) : (
                  <li className="empty-msg">모델이 없습니다.</li>
                )
              ) : (
                <li className="empty-msg">제조사를 먼저 선택하세요.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="history-section">
        <h3 className="section-title">전체 분석 내역 (최신순)</h3>

        {loading && (
          <div className="no-data-wrapper">
            <p>불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className="no-data-wrapper">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && history.length > 0 ? (
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.requestId} className="history-card">
                <div className="card-top-bar"></div>

                <div className="card-body">
                  <h4 className="user-report-title">
                    {item.userName || '사용자'} 님의 리포트
                  </h4>

                  <p className="car-summary">
                    {(item.brandName || '')} {(item.modelName || '')} |{' '}
                    {item.modelYear || '-'}년식 |{' '}
                    {item.mileage ? Number(item.mileage).toLocaleString() : 0}km
                  </p>

                  <p className="car-summary">
                    최종 예상가: {formatPrice(item.finalPriceWon)} |{' '}
                    {formatDate(item.analyzedAt)}
                  </p>

                  <button
                    className="report-btn"
                    onClick={() => navigate(`/result/${item.requestId}`)}
                  >
                    리포트 확인 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !error && history.length === 0 && (
          <div className="no-data-wrapper">
            <p>조회된 데이터가 없습니다.</p>
          </div>
        )}

        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            이전
          </button>

          <button
            className="pagination-btn active"
            type="button"
          >
            {page + 1}
          </button>

          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={history.length < size}
          >
            다음
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;