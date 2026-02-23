export default function SiemIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      {/* Monitor/dashboard frame */}
      <rect x="2" y="3" width="20" height="14" rx="1.5" stroke="#C38BBF" strokeWidth="1.5" />
      {/* Monitor stand */}
      <path d="M8 17v2h8v-2" stroke="#C38BBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="21" x2="18" y2="21" stroke="#C38BBF" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bar chart inside */}
      <rect x="5" y="11" width="2.5" height="4" fill="white" rx="0.5" />
      <rect x="8.5" y="8" width="2.5" height="7" fill="white" rx="0.5" />
      <rect x="12" y="9" width="2.5" height="6" fill="white" rx="0.5" />
      <rect x="15.5" y="6" width="2.5" height="9" fill="white" rx="0.5" />
      {/* Trend line */}
      <path d="M5.5 10 L9 7 L13 8 L17 5" stroke="#C38BBF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
