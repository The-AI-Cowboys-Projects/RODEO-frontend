export default function PackageIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes package-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
          }
          @keyframes ribbon-shimmer {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .package-body {
            animation: package-float 3s ease-in-out infinite;
          }
          .package-ribbon {
            animation: ribbon-shimmer 2s ease-in-out infinite;
          }
        `}
      </style>
      <g className="package-body">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill={primary} />
        <path d="M12 12L3 7v10l9 5 9-5V7l-9 5z" fill={secondary} fillOpacity="0.3" />
      </g>
      <g className="package-ribbon">
        <path d="M12 22V12M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  )
}
