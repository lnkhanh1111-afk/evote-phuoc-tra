import React from 'react';

/**
 * Biểu trưng Quốc huy Việt Nam (Vector SVG sắc nét chuẩn cơ quan Nhà nước)
 */
export default function NationalEmblem({ size = 64, className = "" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient nền đỏ cờ */}
          <radialGradient id="emblemRedGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E52B20" />
            <stop offset="85%" stopColor="#C91B10" />
            <stop offset="100%" stopColor="#9E1007" />
          </radialGradient>

          {/* Gradient màu vàng kim bông lúa */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#D4A017" />
          </linearGradient>

          {/* Gradient bánh răng */}
          <linearGradient id="gearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#D4A017" />
          </linearGradient>

          {/* Gradient dải lụa đỏ */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B31407" />
            <stop offset="50%" stopColor="#E52B20" />
            <stop offset="100%" stopColor="#B31407" />
          </linearGradient>
        </defs>

        {/* Viền ngoài màu vàng kim */}
        <circle cx="100" cy="100" r="96" fill="url(#goldGrad)" stroke="#B8860B" strokeWidth="2" />
        
        {/* Nền trong đỏ thắm */}
        <circle cx="100" cy="100" r="91" fill="url(#emblemRedGrad)" />

        {/* Bông lúa vàng bên trái */}
        <g fill="url(#goldGrad)" stroke="#8B6914" strokeWidth="0.8">
          {/* Nhánh lúa cong trái */}
          <path d="M 28 120 C 22 85 45 42 78 24 C 62 48 50 82 54 122 Z" opacity="0.9" />
          {/* Hạt lúa xếp lớp */}
          <ellipse cx="44" cy="48" rx="8" ry="4" transform="rotate(-35 44 48)" />
          <ellipse cx="36" cy="64" rx="8" ry="4.5" transform="rotate(-25 36 64)" />
          <ellipse cx="32" cy="82" rx="8.5" ry="4.5" transform="rotate(-15 32 82)" />
          <ellipse cx="31" cy="100" rx="8.5" ry="4.5" transform="rotate(0 31 100)" />
          <ellipse cx="34" cy="118" rx="8" ry="4.5" transform="rotate(15 34 118)" />
          <ellipse cx="42" cy="134" rx="8" ry="4.5" transform="rotate(30 42 134)" />
          
          <ellipse cx="54" cy="40" rx="7.5" ry="4" transform="rotate(-45 54 40)" />
          <ellipse cx="68" cy="30" rx="7" ry="3.8" transform="rotate(-55 68 30)" />
          <ellipse cx="84" cy="24" rx="6.5" ry="3.5" transform="rotate(-65 84 24)" />
        </g>

        {/* Bông lúa vàng bên phải (đối xứng) */}
        <g fill="url(#goldGrad)" stroke="#8B6914" strokeWidth="0.8">
          {/* Nhánh lúa cong phải */}
          <path d="M 172 120 C 178 85 155 42 122 24 C 138 48 150 82 146 122 Z" opacity="0.9" />
          {/* Hạt lúa xếp lớp */}
          <ellipse cx="156" cy="48" rx="8" ry="4" transform="rotate(35 156 48)" />
          <ellipse cx="164" cy="64" rx="8" ry="4.5" transform="rotate(25 164 64)" />
          <ellipse cx="168" cy="82" rx="8.5" ry="4.5" transform="rotate(15 168 82)" />
          <ellipse cx="169" cy="100" rx="8.5" ry="4.5" transform="rotate(0 169 100)" />
          <ellipse cx="166" cy="118" rx="8" ry="4.5" transform="rotate(-15 166 118)" />
          <ellipse cx="158" cy="134" rx="8" ry="4.5" transform="rotate(-30 158 134)" />
          
          <ellipse cx="146" cy="40" rx="7.5" ry="4" transform="rotate(45 146 40)" />
          <ellipse cx="132" cy="30" rx="7" ry="3.8" transform="rotate(55 132 30)" />
          <ellipse cx="116" cy="24" rx="6.5" ry="3.5" transform="rotate(65 116 24)" />
        </g>

        {/* Ngôi sao vàng 5 cánh ở chính giữa */}
        <polygon
          points="100,50 108.8,77.2 137.4,77.2 114.3,94 123.1,121.2 100,104.4 76.9,121.2 85.7,94 62.6,77.2 91.2,77.2"
          fill="#FFF033"
          stroke="#D4A017"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Bánh răng công nghiệp (ở dưới chân ngôi sao) */}
        <g fill="url(#gearGrad)" stroke="#8B6914" strokeWidth="1">
          <circle cx="100" cy="148" r="26" />
          {/* Các nan răng bánh xe */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <rect
              key={deg}
              x="96.5"
              y="119"
              width="7"
              height="8"
              transform={`rotate(${deg} 100 148)`}
              fill="url(#gearGrad)"
              stroke="#8B6914"
              strokeWidth="0.8"
            />
          ))}
          <circle cx="100" cy="148" r="16" fill="url(#emblemRedGrad)" stroke="#B8860B" strokeWidth="1.5" />
          <circle cx="100" cy="148" r="7" fill="url(#goldGrad)" />
        </g>

        {/* Dải lụa đỏ quấn quanh bông lúa hai bên */}
        <path
          d="M 32 128 Q 50 120 62 136 Q 48 144 32 128 Z"
          fill="url(#ribbonGrad)"
          stroke="#FFD700"
          strokeWidth="1"
        />
        <path
          d="M 168 128 Q 150 120 138 136 Q 152 144 168 128 Z"
          fill="url(#ribbonGrad)"
          stroke="#FFD700"
          strokeWidth="1"
        />

        {/* Dải lụa đỏ lớn nằm ngang phía dưới */}
        <path
          d="M 30 156 Q 100 145 170 156 L 166 182 Q 100 172 34 182 Z"
          fill="url(#ribbonGrad)"
          stroke="#FFD700"
          strokeWidth="1.5"
        />

        {/* Đuôi nơ dải lụa */}
        <polygon points="34,182 18,172 26,158 36,162" fill="#9E1007" stroke="#FFD700" strokeWidth="1" />
        <polygon points="166,182 182,172 174,158 164,162" fill="#9E1007" stroke="#FFD700" strokeWidth="1" />

        {/* Dòng chữ trang trọng trên dải lụa */}
        <text
          x="100"
          y="167"
          fill="#FFF275"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="0.4"
          stroke="#5C0B04"
          strokeWidth="0.3"
        >
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA
        </text>
        <text
          x="100"
          y="177"
          fill="#FFFFFF"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
          stroke="#5C0B04"
          strokeWidth="0.4"
        >
          VIỆT NAM
        </text>
      </svg>
    </div>
  );
}
