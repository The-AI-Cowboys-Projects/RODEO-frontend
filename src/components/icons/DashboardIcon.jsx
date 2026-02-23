export default function DashboardIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes tile-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          .tile-1 { animation: tile-pulse 2s ease-in-out infinite; }
          .tile-2 { animation: tile-pulse 2s ease-in-out infinite 0.5s; }
          .tile-3 { animation: tile-pulse 2s ease-in-out infinite 1s; }
          .tile-4 { animation: tile-pulse 2s ease-in-out infinite 1.5s; }
        `}
      </style>
      <rect className="tile-1" x="3" y="3" width="7" height="7" rx="1" fill="#800080" />
      <rect className="tile-2" x="14" y="3" width="7" height="7" rx="1" fill="#C38BBF" />
      <rect className="tile-3" x="3" y="14" width="7" height="7" rx="1" fill="#C38BBF" />
      <rect className="tile-4" x="14" y="14" width="7" height="7" rx="1" fill="#800080" />
    </svg>
  )
}
