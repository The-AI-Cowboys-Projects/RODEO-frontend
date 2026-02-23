export default function OptimizeIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes spin-gear {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-arrows {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .gear-spin {
            animation: spin-gear 3s linear infinite;
            transform-origin: 12px 12px;
          }
          .arrows-spin {
            animation: spin-arrows 4s linear infinite;
            transform-origin: 12px 12px;
          }
        `}
      </style>
      {/* Spinning arrows around gear */}
      <g className="arrows-spin">
        {/* Top arrow */}
        <path d="M12 2l2 3h-1.5v2h-1v-2H10l2-3z" fill="#C38BBF" />
        {/* Right arrow */}
        <path d="M22 12l-3 2v-1.5h-2v-1h2V10l3 2z" fill="#C38BBF" />
        {/* Bottom arrow */}
        <path d="M12 22l-2-3h1.5v-2h1v2H14l-2 3z" fill="#C38BBF" />
        {/* Left arrow */}
        <path d="M2 12l3-2v1.5h2v1H5V14l-3-2z" fill="#C38BBF" />
      </g>
      {/* Spinning gear in center */}
      <g className="gear-spin">
        {/* Gear body */}
        <circle cx="12" cy="12" r="4" fill="#800080" />
        {/* Gear teeth */}
        <rect x="11" y="6.5" width="2" height="2" fill="#800080" />
        <rect x="11" y="15.5" width="2" height="2" fill="#800080" />
        <rect x="6.5" y="11" width="2" height="2" fill="#800080" />
        <rect x="15.5" y="11" width="2" height="2" fill="#800080" />
        <rect x="7.5" y="7.5" width="2" height="2" transform="rotate(45 8.5 8.5)" fill="#800080" />
        <rect x="14.5" y="14.5" width="2" height="2" transform="rotate(45 15.5 15.5)" fill="#800080" />
        <rect x="14.5" y="7.5" width="2" height="2" transform="rotate(-45 15.5 8.5)" fill="#800080" />
        <rect x="7.5" y="14.5" width="2" height="2" transform="rotate(-45 8.5 15.5)" fill="#800080" />
        {/* Gear center hole */}
        <circle cx="12" cy="12" r="1.5" fill="white" />
      </g>
    </svg>
  )
}
