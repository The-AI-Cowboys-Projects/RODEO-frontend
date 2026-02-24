export default function SandboxIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes bubble {
            0%, 100% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(-2px); opacity: 0.6; }
          }
          @keyframes liquid-wave {
            0%, 100% { d: path('M7.5 15L10 11v3.5L7.5 18h9l-2.5-3.5V11l2.5 4H7.5z'); }
            50% { d: path('M7.5 15.5L10 11.5v3L7.5 17.5h9l-2.5-3V11.5l2.5 4.5H7.5z'); }
          }
          .bubble-1 { animation: bubble 2s ease-in-out infinite; }
          .bubble-2 { animation: bubble 2s ease-in-out infinite 0.3s; }
          .bubble-3 { animation: bubble 2s ease-in-out infinite 0.6s; }
          .bubble-4 { animation: bubble 2s ease-in-out infinite 0.9s; }
        `}
      </style>
      {/* Flask/beaker shape */}
      <path d="M9 3h6v2h-1v4l5 8v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1l5-8V5H9V3z" fill={primary} />
      {/* Liquid inside */}
      <path d="M7.5 15L10 11v3.5L7.5 18h9l-2.5-3.5V11l2.5 4H7.5z" fill={secondary} fillOpacity="0.5" />
      {/* Virus in flask - center body */}
      <circle cx="12" cy="15.5" r="2" fill="white" />
      {/* Animated virus spikes */}
      <circle className="bubble-1" cx="12" cy="12.5" r="0.6" fill="white" />
      <circle className="bubble-2" cx="12" cy="18.5" r="0.6" fill="white" />
      <circle className="bubble-3" cx="9.5" cy="15.5" r="0.6" fill="white" />
      <circle className="bubble-4" cx="14.5" cy="15.5" r="0.6" fill="white" />
      <circle cx="10.2" cy="13.7" r="0.5" fill="white" />
      <circle cx="13.8" cy="13.7" r="0.5" fill="white" />
      <circle cx="10.2" cy="17.3" r="0.5" fill="white" />
      <circle cx="13.8" cy="17.3" r="0.5" fill="white" />
    </svg>
  )
}
