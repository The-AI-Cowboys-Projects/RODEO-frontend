export default function UnlockIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes shackle-swing {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          @keyframes keyhole-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .shackle-open {
            animation: shackle-swing 2s ease-in-out infinite;
            transform-origin: 16px 7px;
          }
          .keyhole-pulse {
            animation: keyhole-glow 1.5s ease-in-out infinite;
          }
        `}
      </style>
      {/* Lock body */}
      <rect x="5" y="11" width="14" height="10" rx="2" fill="#800080" />
      {/* Keyhole */}
      <circle className="keyhole-pulse" cx="12" cy="16" r="1.5" fill="white" />
      {/* Shackle (open, animated) */}
      <path className="shackle-open" d="M8 11V7a4 4 0 018 0" fill="none" stroke="#C38BBF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
