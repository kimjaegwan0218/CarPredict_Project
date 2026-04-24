import React from "react";
import "./DamageImageUploader.css";

function DamageImageUploader({ label, preview, onClick }) {
  return (
    <div className="damage-photo-item" onClick={onClick}>
      <span className="damage-photo-label">
        {preview ? "✅ " : "+ "} {label}
      </span>

      {preview ? (
        <img src={preview} alt={label} className="damage-mini-preview" />
      ) : (
        <span className="damage-photo-status">추가</span>
      )}
    </div>
  );
}

export default DamageImageUploader;