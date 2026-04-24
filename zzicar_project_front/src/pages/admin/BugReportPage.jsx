import React, { useEffect, useState } from 'react';
import { getBugReports } from '../../api/adminApi';

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function BugReportPage() {
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBugReports() {
      try {
        setLoading(true);
        setError('');
        const data = await getBugReports();
        setBugReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('버그 리포트를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchBugReports();
  }, []);

  if (loading) {
    return (
      <div style={styles.stateBox}>
        <h2 style={styles.stateTitle}>불러오는 중...</h2>
        <p style={styles.stateDesc}>실패한 분석 요청을 가져오고 있습니다.</p>
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
          <h1 style={styles.title}>버그 리포트</h1>
          <p style={styles.desc}>
            분석 요청 중 실패한 내역을 확인하고, 실패 원인을 빠르게 파악할 수 있습니다.
          </p>
        </div>
        <div style={styles.countBadge}>총 {bugReports.length}건</div>
      </div>

      {bugReports.length === 0 ? (
        <div style={styles.stateBox}>
          <h2 style={styles.stateTitle}>버그 리포트가 없습니다.</h2>
          <p style={styles.stateDesc}>현재 FAILED 상태의 분석 요청이 없습니다.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {bugReports.map((item) => (
            <div key={item.requestId} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.requestId}>요청 #{item.requestId}</div>
                  <h3 style={styles.userName}>{item.userName}</h3>
                </div>
                <span style={styles.statusBadge}>{item.status}</span>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoBox}>
                  <span style={styles.label}>사용자 ID</span>
                  <strong>{item.userId}</strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>이메일</span>
                  <strong>{item.email}</strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>이미지 ID</span>
                  <strong>{item.imageId}</strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>원본 파일명</span>
                  <strong>{item.originalFilename || '-'}</strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>요청 시간</span>
                  <strong>{formatDateTime(item.requestedAt)}</strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>시작 시간</span>
                  <strong>{formatDateTime(item.startedAt)}</strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>종료 시간</span>
                  <strong>{formatDateTime(item.finishedAt)}</strong>
                </div>
              </div>

              <div style={styles.errorBox}>
                <span style={styles.errorLabel}>에러 메시지</span>
                <pre style={styles.errorText}>
                  {item.errorMessage || '에러 메시지가 없습니다.'}
                </pre>
              </div>
            </div>
          ))}
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
  list: {
    display: 'grid',
    gap: '18px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '22px',
    padding: '24px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  requestId: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '6px',
    fontWeight: 700,
  },
  userName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 800,
    color: '#111827',
  },
  statusBadge: {
    background: '#fee2e2',
    color: '#b91c1c',
    fontWeight: 800,
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '13px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },
  infoBox: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '14px 16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 700,
  },
  errorBox: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '16px',
    padding: '16px',
  },
  errorLabel: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '13px',
    color: '#9a3412',
    fontWeight: 800,
  },
  errorText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#7c2d12',
    fontFamily: 'inherit',
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