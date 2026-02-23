export default function ThreatIntelIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      {/* Crosshair/Target outer circle */}
      <circle cx="12" cy="12" r="9" stroke="#C38BBF" strokeWidth="1.5" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="5" stroke="#C38BBF" strokeWidth="1.2" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill="white" />
      {/* Crosshair lines */}
      <line x1="12" y1="1" x2="12" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="12" x2="5" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="12" x2="23" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Alert indicator */}
      <circle cx="18" cy="6" r="3" fill="#C38BBF" stroke="#C38BBF" strokeWidth="1" />
      <text x="18" y="7.5" fontSize="4" fontWeight="bold" fill="white" textAnchor="middle">!</text>
    </svg>
  )
}
