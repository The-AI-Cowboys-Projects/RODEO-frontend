export default function PlaybookIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <rect x="4" y="2" width="14" height="20" rx="2" stroke="#C38BBF" strokeWidth="1.5" />
      <path d="M10 9L15 12L10 15V9Z" fill="#C38BBF" />
      <line x1="8" y1="6" x2="14" y2="6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="19" x2="14" y2="19" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
