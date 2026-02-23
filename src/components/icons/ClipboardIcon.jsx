export default function ClipboardIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes check-line {
            0%, 100% { width: 8px; }
            50% { width: 6px; }
          }
          @keyframes clip-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
          }
          .line-scan-1 { animation: check-line 2s ease-in-out infinite; }
          .line-scan-2 { animation: check-line 2s ease-in-out infinite 0.3s; }
          .line-scan-3 { animation: check-line 2s ease-in-out infinite 0.6s; }
          .clip-top {
            animation: clip-bounce 3s ease-in-out infinite;
          }
        `}
      </style>
      {/* Clipboard body */}
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="#800080" />
      {/* Clip */}
      <rect className="clip-top" x="8" y="2" width="8" height="4" rx="1" fill="#C38BBF" />
      {/* Animated lines */}
      <rect className="line-scan-1" x="8" y="10" width="8" height="1.5" rx="0.5" fill="white" />
      <rect className="line-scan-2" x="8" y="13" width="6" height="1.5" rx="0.5" fill="white" />
      <rect className="line-scan-3" x="8" y="16" width="7" height="1.5" rx="0.5" fill="white" />
    </svg>
  )
}
