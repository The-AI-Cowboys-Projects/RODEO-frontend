export default function LogAnomalyIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', detail = 'white', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={secondary} strokeWidth="1.5" />
      <line x1="7" y1="8" x2="17" y2="8" stroke={detail} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="12" x2="13" y2="12" stroke={detail} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="16" x2="11" y2="16" stroke={detail} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 14L18.5 17H15.5L17 14Z" fill={secondary} stroke={secondary} strokeWidth="0.5" />
      <line x1="17" y1="18" x2="17" y2="18.5" stroke={detail} strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
