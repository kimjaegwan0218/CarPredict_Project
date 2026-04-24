import React from 'react';
import './ImageUploader.css';

const ImageUploader = ({ images, onImageChange }) => {
  // 삭제 함수 추가
  const handleRemove = (index, e) => {
    e.preventDefault(); // 라벨 클릭 이벤트 전파 방지
    onImageChange(index, null); // 해당 인덱스를 null로 초기화
  };

  return (
    <div className="uploader-wrapper">
      <div className="info-text">
        <h3>차량 상태 사진을 등록해주세요</h3>
        <p>파손 부위가 잘 보이도록 촬영한 사진 6장을 올려주세요.</p>
      </div>

      <div className="image-grid">
        {images.map((img, idx) => (
          <div key={idx} className="image-box">
            {img ? (
              <div className="preview-container">
                <img src={img} alt={`upload-${idx}`} className="preview-img" />
                {/* 삭제 버튼 추가 */}
                <button className="delete-btn" onClick={(e) => handleRemove(idx, e)}>×</button>
              </div>
            ) : (
              <label className="upload-label">
                <div className="upload-content">
                  <span className="plus-icon">+</span>
                  <span className="upload-text">사진 추가</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onImageChange(idx, e.target.files[0])} 
                  style={{ display: 'none' }} 
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;