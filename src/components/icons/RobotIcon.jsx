/**
 * Robot Silhouette Icon
 * A stylized robot head with blinking eyes
 */

export default function RobotIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <style>
        {`
          @keyframes blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          @keyframes antenna-pulse {
            0%, 100% { opacity: 1; r: 1.5; }
            50% { opacity: 0.6; r: 2; }
          }
          .robot-eye {
            animation: blink 3s ease-in-out infinite;
            transform-origin: center;
          }
          .robot-eye-left { animation-delay: 0s; }
          .robot-eye-right { animation-delay: 0.1s; }
          .antenna-glow {
            animation: antenna-pulse 2s ease-in-out infinite;
          }
        `}
      </style>
      {/* Antenna */}
      <circle className="antenna-glow" cx="12" cy="2" r="1.5" fill={secondary} />
      <rect x="11" y="3" width="2" height="3" fill={secondary} />

      {/* Robot Head */}
      <rect x="4" y="6" width="16" height="14" rx="3" fill={primary} />

      {/* Eyes */}
      <g className="robot-eye robot-eye-left">
        <circle cx="8.5" cy="12" r="2.5" fill="white" />
      </g>
      <g className="robot-eye robot-eye-right">
        <circle cx="15.5" cy="12" r="2.5" fill="white" />
      </g>

      {/* Mouth/Speaker grille */}
      <rect x="7" y="16" width="10" height="2" rx="1" fill="white" />

      {/* Ear bolts */}
      <circle cx="2" cy="13" r="1.5" fill={secondary} />
      <circle cx="22" cy="13" r="1.5" fill={secondary} />
    </svg>
  )
}
