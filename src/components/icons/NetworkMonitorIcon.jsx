export default function NetworkMonitorIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <style>
        {`
          @keyframes wave-expand {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.3); }
          }
          @keyframes signal-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes data-ping {
            0%, 100% { opacity: 0.6; r: 0.8; }
            50% { opacity: 1; r: 1.2; }
          }
          .wave-left-1 { animation: signal-pulse 1.5s ease-in-out infinite; }
          .wave-left-2 { animation: signal-pulse 1.5s ease-in-out infinite 0.3s; }
          .wave-right-1 { animation: signal-pulse 1.5s ease-in-out infinite 0.15s; }
          .wave-right-2 { animation: signal-pulse 1.5s ease-in-out infinite 0.45s; }
          .ping-1 { animation: data-ping 2s ease-in-out infinite; }
          .ping-2 { animation: data-ping 2s ease-in-out infinite 0.5s; }
          .ping-3 { animation: data-ping 2s ease-in-out infinite 1s; }
          .ping-4 { animation: data-ping 2s ease-in-out infinite 1.5s; }
        `}
      </style>
      {/* Antenna base */}
      <rect x="10" y="18" width="4" height="4" rx="0.5" fill={secondary} />
      {/* Antenna pole */}
      <line x1="12" y1="18" x2="12" y2="10" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
      {/* Antenna top */}
      <circle cx="12" cy="8" r="2" fill={secondary} />
      {/* Animated signal waves - left */}
      <path className="wave-left-1" d="M6 10c-1.5-1.5-2.5-3.5-2.5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path className="wave-left-2" d="M8 11c-1-1-1.8-2.5-1.8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Animated signal waves - right */}
      <path className="wave-right-1" d="M18 10c1.5-1.5 2.5-3.5 2.5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path className="wave-right-2" d="M16 11c1-1 1.8-2.5 1.8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Animated data pulses */}
      <circle className="ping-1" cx="5" cy="14" r="1" fill="white" />
      <circle className="ping-2" cx="19" cy="14" r="1" fill="white" />
      <circle className="ping-3" cx="3" cy="17" r="0.8" fill="white" />
      <circle className="ping-4" cx="21" cy="17" r="0.8" fill="white" />
    </svg>
  )
}
