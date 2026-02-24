export default function VirusIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes virus-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes virus-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .virus-body {
            animation: virus-pulse 2s ease-in-out infinite;
            transform-origin: 12px 12px;
          }
          .virus-spikes {
            animation: virus-rotate 8s linear infinite;
            transform-origin: 12px 12px;
          }
        `}
      </style>
      {/* Rotating spikes */}
      <g className="virus-spikes">
        <circle cx="12" cy="3" r="1.5" fill={secondary} />
        <circle cx="12" cy="21" r="1.5" fill={secondary} />
        <circle cx="3" cy="12" r="1.5" fill={secondary} />
        <circle cx="21" cy="12" r="1.5" fill={secondary} />
        <circle cx="5.5" cy="5.5" r="1.2" fill={primary} />
        <circle cx="18.5" cy="5.5" r="1.2" fill={primary} />
        <circle cx="5.5" cy="18.5" r="1.2" fill={primary} />
        <circle cx="18.5" cy="18.5" r="1.2" fill={primary} />
        {/* Connectors */}
        <rect x="11" y="5" width="2" height="3" fill={secondary} />
        <rect x="11" y="16" width="2" height="3" fill={secondary} />
        <rect x="5" y="11" width="3" height="2" fill={secondary} />
        <rect x="16" y="11" width="3" height="2" fill={secondary} />
      </g>
      {/* Pulsing center body */}
      <g className="virus-body">
        <circle cx="12" cy="12" r="5" fill={primary} />
        {/* White details on body */}
        <circle cx="10.5" cy="11" r="1" fill="white" />
        <circle cx="13.5" cy="13" r="1" fill="white" />
      </g>
    </svg>
  )
}
