export default function EDRIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      {/* Computer/endpoint */}
      <rect x="4" y="4" width="16" height="12" rx="2" fill="#E8B4E6" fillOpacity="0.3" stroke="#E8B4E6" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="6" y="6" width="12" height="8" rx="1" fill={primary} fillOpacity="0.5" />
      {/* Shield on screen */}
      <path d="M12 7l-3 1.5v3c0 2 1.5 3.5 3 4 1.5-.5 3-2 3-4v-3L12 7z" fill="#E8B4E6" />
      {/* Checkmark */}
      <path d="M10.5 11l1 1 2-2" fill="none" stroke={primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stand */}
      <rect x="10" y="16" width="4" height="2" fill="#E8B4E6" fillOpacity="0.5" />
      <rect x="8" y="18" width="8" height="2" rx="1" fill="#E8B4E6" />
    </svg>
  )
}
