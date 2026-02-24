export default function AssetInventoryIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      {/* Main monitor */}
      <rect x="4" y="2" width="16" height="11" rx="1" stroke={secondary} strokeWidth="1.5" />
      <rect x="9" y="13" width="6" height="2" fill={secondary} />
      <rect x="7" y="15" width="10" height="1" rx="0.5" fill={secondary} />
      {/* Screen content - grid pattern */}
      <rect x="6" y="4" width="5" height="3" rx="0.3" stroke="white" strokeWidth="0.8" />
      <rect x="13" y="4" width="5" height="3" rx="0.3" stroke="white" strokeWidth="0.8" />
      <rect x="6" y="8.5" width="5" height="2.5" rx="0.3" stroke="white" strokeWidth="0.8" />
      <rect x="13" y="8.5" width="5" height="2.5" rx="0.3" stroke="white" strokeWidth="0.8" />
      {/* Server stack below */}
      <rect x="2" y="18" width="8" height="3" rx="0.5" stroke={secondary} strokeWidth="1" />
      <circle cx="4" cy="19.5" r="0.6" fill="white" />
      <rect x="5.5" y="19" width="3" height="1" rx="0.3" fill="white" />
      <rect x="14" y="18" width="8" height="3" rx="0.5" stroke={secondary} strokeWidth="1" />
      <circle cx="16" cy="19.5" r="0.6" fill="white" />
      <rect x="17.5" y="19" width="3" height="1" rx="0.3" fill="white" />
    </svg>
  )
}
