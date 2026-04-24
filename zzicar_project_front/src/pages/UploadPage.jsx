import React from 'react';
import CarUploadForm from '../features/analysis/CarUploadForm';

function UploadPage() {
  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '40px auto',
        padding: '0 20px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '34px',
            fontWeight: '900',
            color: '#111',
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}
        >
          차량 감가 분석 시작
        </h2>

        <p
          style={{
            fontSize: '18px',
            color: '#666',
            margin: 0,
            lineHeight: '1.6',
          }}
        >
          대표 차량 사진 1장과 파손 사진을 등록한 뒤 분석을 시작해 주세요.
        </p>
      </div>

      <CarUploadForm />
    </div>
  );
}

export default UploadPage;