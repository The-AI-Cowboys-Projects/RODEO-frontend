export default function NetworkIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes data-flow {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes node-pulse {
            0%, 100% { r: 1; opacity: 1; }
            50% { r: 1.5; opacity: 0.7; }
          }
          @keyframes device-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .data-line {
            stroke-dasharray: 4 2;
            animation: data-flow 1.5s linear infinite;
          }
          .node-1 { animation: node-pulse 2s ease-in-out infinite; }
          .node-2 { animation: node-pulse 2s ease-in-out infinite 0.5s; }
          .device-light-1 { animation: device-blink 1s ease-in-out infinite; }
          .device-light-2 { animation: device-blink 1s ease-in-out infinite 0.2s; }
          .device-light-3 { animation: device-blink 1s ease-in-out infinite 0.4s; }
        `}
      </style>
      {/* Top-left monitor */}
      <rect x="1" y="2" width="7" height="5" rx="0.5" fill="none" stroke="#C38BBF" strokeWidth="1.2" />
      <rect x="3.5" y="7" width="2" height="1.5" fill="#C38BBF" />
      <rect x="2.5" y="8.5" width="4" height="0.8" rx="0.3" fill="#C38BBF" />

      {/* Bottom-right monitor */}
      <rect x="16" y="14" width="7" height="5" rx="0.5" fill="none" stroke="#C38BBF" strokeWidth="1.2" />
      <rect x="18.5" y="19" width="2" height="1.5" fill="#C38BBF" />
      <rect x="17.5" y="20.5" width="4" height="0.8" rx="0.3" fill="#C38BBF" />

      {/* Top-right small device */}
      <rect x="17" y="3" width="5" height="2.5" rx="0.5" fill="none" stroke="white" strokeWidth="1" />
      <circle className="device-light-1" cx="18.2" cy="4.25" r="0.4" fill="white" />
      <circle className="device-light-2" cx="19.5" cy="4.25" r="0.4" fill="white" />
      <circle className="device-light-3" cx="20.8" cy="4.25" r="0.4" fill="white" />

      {/* Bottom-left small device */}
      <rect x="2" y="17" width="5" height="2.5" rx="0.5" fill="none" stroke="white" strokeWidth="1" />
      <circle className="device-light-1" cx="3.2" cy="18.25" r="0.4" fill="white" />
      <circle className="device-light-2" cx="4.5" cy="18.25" r="0.4" fill="white" />
      <circle className="device-light-3" cx="5.8" cy="18.25" r="0.4" fill="white" />

      {/* Animated connection lines */}
      <line className="data-line" x1="4.5" y1="9.3" x2="4.5" y2="12" stroke="#C38BBF" strokeWidth="1" />
      <line className="data-line" x1="4.5" y1="12" x2="4.5" y2="17" stroke="#C38BBF" strokeWidth="1" />
      <line className="data-line" x1="4.5" y1="12" x2="19.5" y2="12" stroke="#C38BBF" strokeWidth="1" />
      <line className="data-line" x1="19.5" y1="12" x2="19.5" y2="14" stroke="#C38BBF" strokeWidth="1" />
      <line className="data-line" x1="19.5" y1="5.5" x2="19.5" y2="12" stroke="white" strokeWidth="1" />

      {/* Pulsing connection nodes */}
      <circle className="node-1" cx="4.5" cy="12" r="1" fill="#C38BBF" />
      <circle className="node-2" cx="19.5" cy="12" r="1" fill="#C38BBF" />
    </svg>
  )
}
