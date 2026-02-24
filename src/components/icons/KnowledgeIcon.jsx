export default function KnowledgeIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H18.5C19.33 3 20 3.67 20 4.5V19.5C20 20.33 19.33 21 18.5 21H5.5C4.67 21 4 20.33 4 19.5Z" stroke={secondary} strokeWidth="1.5" />
      <line x1="8" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="10.5" x2="16" y2="10.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="14" x2="13" y2="14" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="17" cy="17" r="3.5" stroke={secondary} strokeWidth="1.5" fill="none" />
      <line x1="19.5" y1="19.5" x2="22" y2="22" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
