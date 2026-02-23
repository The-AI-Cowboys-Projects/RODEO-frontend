export default function PatchIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes heal-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          @keyframes dot-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .bandage-body {
            animation: heal-pulse 2s ease-in-out infinite;
            transform-origin: center;
          }
          .heal-dot-1 { animation: dot-blink 1.5s ease-in-out infinite; }
          .heal-dot-2 { animation: dot-blink 1.5s ease-in-out infinite 0.2s; }
          .heal-dot-3 { animation: dot-blink 1.5s ease-in-out infinite 0.4s; }
          .heal-dot-4 { animation: dot-blink 1.5s ease-in-out infinite 0.6s; }
        `}
      </style>
      <g className="bandage-body">
        {/* Bandage shape */}
        <rect x="2" y="8" width="20" height="8" rx="4" fill="#800080" />
        {/* Center pad */}
        <rect x="8" y="9" width="8" height="6" rx="1" fill="white" fillOpacity="0.7" />
      </g>
      {/* Animated dots on pad */}
      <circle className="heal-dot-1" cx="10" cy="12" r="0.8" fill="#800080" />
      <circle className="heal-dot-2" cx="12" cy="11" r="0.8" fill="#C38BBF" />
      <circle className="heal-dot-3" cx="14" cy="13" r="0.8" fill="#800080" />
      <circle className="heal-dot-4" cx="12" cy="13" r="0.8" fill="#C38BBF" />
    </svg>
  )
}
