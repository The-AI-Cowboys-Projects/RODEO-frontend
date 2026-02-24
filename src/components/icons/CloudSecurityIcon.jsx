export default function CloudSecurityIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      {/* Cloud shape */}
      <path
        d="M6.5 18.5C3.5 18.5 1 16.2 1 13.5c0-2.3 1.7-4.3 4-4.8 0-0.2 0-0.4 0-0.7 0-3.3 2.7-6 6-6 2.8 0 5.2 2 5.8 4.6 0.4-0.1 0.8-0.1 1.2-0.1 2.8 0 5 2.2 5 5 0 2.8-2.2 5-5 5H6.5z"
        stroke={secondary}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Shield inside cloud */}
      <path
        d="M12 9v7"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M9 11.5l3-1.5 3 1.5v3c0 1-1.5 2.5-3 3-1.5-0.5-3-2-3-3v-3z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Lock keyhole */}
      <circle cx="12" cy="13" r="1" fill="white" />
    </svg>
  )
}
