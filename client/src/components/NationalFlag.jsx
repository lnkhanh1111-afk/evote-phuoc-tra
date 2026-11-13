import React from 'react';

/**
 * Quốc kỳ Việt Nam (Cờ đỏ sao vàng) chuẩn tỷ lệ 2:3
 */
export default function NationalFlag({ className = "w-8 h-5", rounded = "rounded-sm", shadow = "shadow-sm" }) {
  return (
    <div className={`relative inline-block overflow-hidden ${rounded} ${shadow} ${className}`}>
      <svg
        viewBox="0 0 900 600"
        className="w-full h-full object-cover block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Nền đỏ cờ */}
        <rect width="900" height="600" fill="#DA251D" />
        {/* Ngôi sao vàng 5 cánh */}
        <polygon
          points="450,120 490.4,244.4 621.2,244.4 515.4,321.2 555.8,445.6 450,368.8 344.2,445.6 384.6,321.2 278.8,244.4 409.6,244.4"
          fill="#FFFF00"
        />
      </svg>
    </div>
  );
}
