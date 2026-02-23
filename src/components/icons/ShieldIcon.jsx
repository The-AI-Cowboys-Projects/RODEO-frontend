export default function ShieldIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes shield-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          @keyframes check-draw {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          .shield-glow {
            animation: shield-pulse 2s ease-in-out infinite;
          }
          .check-animate {
            stroke-dasharray: 20;
            animation: check-draw 2s ease-in-out infinite;
          }
        `}
      </style>
      {/* Shield shape */}
      <path d="M12 2L4 6v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V6l-8-4z" fill="#800080" />
      {/* Inner shield accent with glow */}
      <path className="shield-glow" d="M12 4L6 7v5c0 4.5 2.5 8 6 9 3.5-1 6-4.5 6-9V7l-6-3z" fill="#C38BBF" />
      {/* Animated checkmark */}
      <path className="check-animate" d="M9 12l2 2 4-4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
