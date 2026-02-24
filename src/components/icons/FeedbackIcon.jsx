export default function FeedbackIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 12C22 6.48 17.52 2 12 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      <path d="M22 12L19 9" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 12L19 15" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
