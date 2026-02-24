export default function BCDRIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes bcdr-flame {
            0%, 100% { transform: scaleY(1); opacity: 0.9; }
            50% { transform: scaleY(1.1); opacity: 1; }
          }
          @keyframes bcdr-gear {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .bcdr-flame-anim {
            animation: bcdr-flame 1.5s ease-in-out infinite;
            transform-origin: center bottom;
          }
          .bcdr-gear-anim {
            animation: bcdr-gear 6s linear infinite;
            transform-origin: 19.5px 19.5px;
          }
        `}
      </style>
      {/* Document body */}
      <rect x="4" y="2" width="13" height="17" rx="2" fill={primary} />
      <rect x="5" y="3" width="11" height="15" rx="1.5" fill="white" />
      {/* Checklist lines */}
      <rect x="10" y="5.5" width="4.5" height="1" rx="0.5" fill={secondary} />
      <rect x="10" y="8.5" width="4.5" height="1" rx="0.5" fill={secondary} />
      <rect x="10" y="11.5" width="4.5" height="1" rx="0.5" fill={secondary} />
      <rect x="10" y="14.5" width="3" height="1" rx="0.5" fill={secondary} />
      {/* Checkboxes */}
      <rect x="6.5" y="5" width="2" height="2" rx="0.4" fill="none" stroke={primary} strokeWidth="0.6" />
      <rect x="6.5" y="8" width="2" height="2" rx="0.4" fill="none" stroke={primary} strokeWidth="0.6" />
      <rect x="6.5" y="11" width="2" height="2" rx="0.4" fill="none" stroke={primary} strokeWidth="0.6" />
      <rect x="6.5" y="14" width="2" height="2" rx="0.4" fill="none" stroke={primary} strokeWidth="0.6" />
      {/* Checkmarks in first two boxes */}
      <path d="M7 6.2l0.6 0.6 1-1" fill="none" stroke={primary} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9.2l0.6 0.6 1-1" fill="none" stroke={primary} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Flame circle (top-right overlap) */}
      <circle cx="17" cy="5" r="4" fill={primary} />
      <circle cx="17" cy="5" r="3.2" fill={secondary} opacity="0.3" />
      {/* Flame icon */}
      <g className="bcdr-flame-anim">
        <path d="M17 2.5c0 0-1.8 1.5-1.8 3 0 0.7 0.4 1.3 0.9 1.6 -0.1-0.4 0.1-0.9 0.5-1.2 0.1 0.8 0.6 1.5 1.2 1.8 0.3-0.2 0.5-0.5 0.5-0.9 0.3 0.3 0.5 0.7 0.5 1.1 0.5-0.3 0.9-0.9 0.9-1.6C19.7 4.5 17 2.5 17 2.5z" fill="white" />
      </g>
      {/* Gear (bottom-right overlap) */}
      <g className="bcdr-gear-anim">
        <path d="M19.5 17.2l0.5-0.1 0.3 0.8 -0.5 0.1c0.1 0.2 0.1 0.4 0.1 0.6l0.5 0.1 -0.1 0.9 -0.5-0.1c-0.1 0.2-0.2 0.4-0.3 0.5l0.3 0.4 -0.7 0.6 -0.3-0.4c-0.2 0.1-0.4 0.2-0.6 0.2l0 0.5 -0.9 0 0-0.5c-0.2 0-0.4-0.1-0.6-0.2l-0.3 0.4 -0.7-0.6 0.3-0.4c-0.1-0.2-0.2-0.3-0.3-0.5l-0.5 0.1 -0.1-0.9 0.5-0.1c0-0.2 0-0.4 0.1-0.6l-0.5-0.1 0.3-0.8 0.5 0.1c0.1-0.2 0.2-0.3 0.4-0.5l-0.3-0.4 0.7-0.5 0.3 0.4c0.2-0.1 0.3-0.1 0.5-0.2l0-0.5 0.9 0 0 0.5c0.2 0 0.4 0.1 0.5 0.2l0.3-0.4 0.7 0.5 -0.3 0.4c0.1 0.2 0.3 0.3 0.4 0.5z" fill={primary} />
        <circle cx="19.5" cy="19.5" r="1.2" fill="white" />
        <circle cx="19.5" cy="19.5" r="0.6" fill={secondary} />
      </g>
      {/* Document corner fold */}
      <path d="M14 2L17 2L17 5z" fill={secondary} opacity="0.4" />
    </svg>
  )
}
