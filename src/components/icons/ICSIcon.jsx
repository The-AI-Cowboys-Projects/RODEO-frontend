export default function ICSIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      {/* PLC body */}
      <rect x="3" y="5" width="18" height="14" rx="2" fill="#E8B4E6" fillOpacity="0.3" stroke="#E8B4E6" strokeWidth="1.5" />
      {/* Status lights */}
      <circle cx="7" cy="9" r="1.5" fill="#4ade80" />
      <circle cx="12" cy="9" r="1.5" fill="#facc15" />
      <circle cx="17" cy="9" r="1.5" fill="#800080" />
      {/* Register lines */}
      <line x1="6" y1="13" x2="18" y2="13" stroke="#E8B4E6" strokeWidth="1" />
      <line x1="6" y1="15.5" x2="18" y2="15.5" stroke="#E8B4E6" strokeWidth="1" />
      {/* Connectors */}
      <rect x="5" y="3" width="2" height="2" rx="0.5" fill="#E8B4E6" />
      <rect x="11" y="3" width="2" height="2" rx="0.5" fill="#E8B4E6" />
      <rect x="17" y="3" width="2" height="2" rx="0.5" fill="#E8B4E6" />
    </svg>
  )
}
