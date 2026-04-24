import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminMainPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>관리자 메인페이지</h1>
      <p>버그 리포트와 AI 분석 결과 관리 기능으로 이동할 수 있습니다.</p>

      <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
        <button onClick={() => navigate('/admin/bug-reports')}>
          버그 리포트 보러가기
        </button>
        <button onClick={() => navigate('/admin/analysis-results')}>
          AI 분석 결과 보러가기
        </button>
      </div>
    </div>
  );
}