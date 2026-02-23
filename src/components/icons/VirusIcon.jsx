export default function VirusIcon({ className = 'w-5 h-5', ...props }) {
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
        <circle cx="12" cy="3" r="1.5" fill="#C38BBF" />
        <circle cx="12" cy="21" r="1.5" fill="#C38BBF" />
        <circle cx="3" cy="12" r="1.5" fill="#C38BBF" />
        <circle cx="21" cy="12" r="1.5" fill="#C38BBF" />
        <circle cx="5.5" cy="5.5" r="1.2" fill="#800080" />
        <circle cx="18.5" cy="5.5" r="1.2" fill="#800080" />
        <circle cx="5.5" cy="18.5" r="1.2" fill="#800080" />
        <circle cx="18.5" cy="18.5" r="1.2" fill="#800080" />
        {/* Connectors */}
        <rect x="11" y="5" width="2" height="3" fill="#C38BBF" />
        <rect x="11" y="16" width="2" height="3" fill="#C38BBF" />
        <rect x="5" y="11" width="3" height="2" fill="#C38BBF" />
        <rect x="16" y="11" width="3" height="2" fill="#C38BBF" />
      </g>
      {/* Pulsing center body */}
      <g className="virus-body">
        <circle cx="12" cy="12" r="5" fill="#800080" />
        {/* White details on body */}
        <circle cx="10.5" cy="11" r="1" fill="white" />
        <circle cx="13.5" cy="13" r="1" fill="white" />
      </g>
    </svg>
  )
}
