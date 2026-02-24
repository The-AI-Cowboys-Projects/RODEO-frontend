export default function UserIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke={secondary} strokeWidth="1.5" />
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
