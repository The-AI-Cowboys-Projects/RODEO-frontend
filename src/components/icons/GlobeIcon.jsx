export default function GlobeIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes globe-spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          @keyframes longitude-shift {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(2px); }
          }
          .globe-lines {
            animation: longitude-shift 4s ease-in-out infinite;
          }
        `}
      </style>
      {/* Globe circle */}
      <circle cx="12" cy="12" r="10" fill="#800080" />
      {/* Inner glow */}
      <circle cx="12" cy="12" r="8" fill="#C38BBF" fillOpacity="0.3" />
      {/* Animated lines */}
      <g className="globe-lines">
        {/* Latitude lines */}
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
        <ellipse cx="12" cy="12" rx="10" ry="7" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        {/* Longitude line */}
        <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      </g>
      {/* Center meridian */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  )
}
