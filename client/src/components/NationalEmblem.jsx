import React from 'react';
import quocHuyImg from '../assets/quoc-huy.png';

/**
 * Biểu trưng Quốc huy Việt Nam chính thức (Hình ảnh chuẩn chuẩn Quốc gia do Hội đồng nhân dân cung cấp)
 */
export default function NationalEmblem({ size = 64, className = "" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <img
        src={quocHuyImg}
        alt="Quốc huy nước Cộng hòa Xã hội Chủ nghĩa Việt Nam"
        className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
      />
    </div>
  );
}
