export default function WatcherIcon({ className = 'w-5 h-5', primary = '#800080', secondary = '#C38BBF', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <style>{`
        @keyframes watcher-blink {
          0%, 90%, 100% { d: path("M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"); }
          95% { d: path("M1 12C1 12 5 11 12 11C19 11 23 12 23 12C23 12 19 13 12 13C5 13 1 12 1 12Z"); }
        }
        .watcher-eye { animation: watcher-blink 5s ease-in-out infinite; }
        @keyframes watcher-pupil-blink {
          0%, 90%, 100% { r: 1.5; }
          95% { r: 0.3; }
        }
        .watcher-pupil { animation: watcher-pupil-blink 5s ease-in-out infinite; }
        @keyframes watcher-iris-blink {
          0%, 90%, 100% { r: 3.5; }
          95% { r: 0.8; }
        }
        .watcher-iris { animation: watcher-iris-blink 5s ease-in-out infinite; }
      `}</style>
      <path className="watcher-eye" d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke={secondary} strokeWidth="1.5" />
      <circle className="watcher-iris" cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" />
      <circle className="watcher-pupil" cx="12" cy="12" r="1.5" fill={secondary} />
      <path d="M12 2V4" stroke={secondary} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 4.5L6 6" stroke={secondary} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19.5 4.5L18 6" stroke={secondary} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
