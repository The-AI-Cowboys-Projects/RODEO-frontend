export default function WatcherIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="#C38BBF" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#C38BBF" />
      <path d="M12 2V4" stroke="#C38BBF" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 4.5L6 6" stroke="#C38BBF" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19.5 4.5L18 6" stroke="#C38BBF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
