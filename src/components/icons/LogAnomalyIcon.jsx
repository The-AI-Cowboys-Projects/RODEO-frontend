export default function LogAnomalyIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#C38BBF" strokeWidth="1.5" />
      <line x1="7" y1="8" x2="17" y2="8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="12" x2="13" y2="12" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="16" x2="11" y2="16" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 14L18.5 17H15.5L17 14Z" fill="#C38BBF" stroke="#C38BBF" strokeWidth="0.5" />
      <line x1="17" y1="18" x2="17" y2="18.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
