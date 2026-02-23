export default function BoltIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .bolt-flash {
            animation: flash 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <path className="bolt-flash" d="M13 2L4 14h7v8l9-12h-7V2z" fill="#800080" />
      <path d="M12 6L6 14h5v4l6-8h-5V6z" fill="#C38BBF" fillOpacity="0.4" />
    </svg>
  )
}
