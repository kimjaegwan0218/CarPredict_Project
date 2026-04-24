import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminAnalysisCards } from '../../api/adminApi';

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString();
}

export default function AdminAnalysisCardsPage() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true);
        setError('');
        const data = await getAdminAnalysisCards();
        setCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('AI 분석 결과를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div style={styles.stateBox}>
        <h2 style={styles.stateTitle}>불러오는 중...</h2>
        <p style={styles.stateDesc}>전체 분석 결과 카드를 가져오고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.stateBox}>
        <h2 style={styles.stateTitle}>오류 발생</h2>
        <p style={styles.stateDesc}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>AI 분석 결과</h1>
          <p style={styles.desc}>
            완료된 전체 분석 결과를 관리자 카드 형태로 확인할 수 있습니다.
          </p>
        </div>
        <div style={styles.countBadge}>총 {cards.length}건</div>
      </div>

      {cards.length === 0 ? (
        <div style={styles.stateBox}>
          <h2 style={styles.stateTitle}>분석 결과가 없습니다.</h2>
          <p style={styles.stateDesc}>현재 DONE 상태의 분석 결과가 없습니다.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {cards.map((item) => {
            const imageUrl = item.imagePath
              ? `http://localhost:8080${item.imagePath}`
              : null;

            return (
              <div key={item.requestId} style={styles.card}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${item.brandName} ${item.modelName}`}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.imagePlaceholder}>이미지 없음</div>
                )}

                <div style={styles.cardBody}>
                  <div style={styles.userRow}>
                    <span style={styles.userBadge}>{item.userName}</span>
                    <span style={styles.dateText}>{formatDate(item.analyzedAt)}</span>
                  </div>

                  <h3 style={styles.vehicleTitle}>
                    {item.brandName} {item.modelName}
                  </h3>

                  <p style={styles.metaText}>
                    {item.modelYear}년식 | {formatNumber(item.mileage)}km
                  </p>

                  <p style={styles.priceText}>
                    최종 예상가: {formatNumber(item.finalPriceWon)}원
                  </p>

                  <button
                    type="button"
                    style={styles.detailButton}
                    onClick={() => navigate(`/result/${item.requestId}`)}
                  >
                    리포트 확인 →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: 800,
    color: '#111827',
  },
  desc: {
    margin: '10px 0 0',
    color: '#6b7280',
    lineHeight: 1.6,
    fontSize: '15px',
  },
  countBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    fontWeight: 800,
    borderRadius: '999px',
    padding: '10px 16px',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
  },
  image: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    display: 'block',
    background: '#f3f4f6',
  },
  imagePlaceholder: {
    width: '100%',
    height: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    color: '#6b7280',
    fontWeight: 700,
  },
  cardBody: {
    padding: '20px',
  },
  userRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  userBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '999px',
    padding: '7px 12px',
    fontSize: '13px',
    fontWeight: 800,
  },
  dateText: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: 700,
  },
  vehicleTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 800,
    color: '#111827',
  },
  metaText: {
    margin: '10px 0 0',
    color: '#6b7280',
    fontSize: '15px',
  },
  priceText: {
    margin: '18px 0 20px',
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: 800,
  },
  detailButton: {
    border: 'none',
    background: '#0f172a',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  stateBox: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '50px 24px',
    textAlign: 'center',
    border: '1px dashed #d1d5db',
  },
  stateTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 800,
    color: '#111827',
  },
  stateDesc: {
    margin: '12px 0 0',
    color: '#6b7280',
    lineHeight: 1.6,
  },
};