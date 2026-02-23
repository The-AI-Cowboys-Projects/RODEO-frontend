export default function PolicyIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <style>
        {`
          @keyframes line-appear {
            0%, 100% { opacity: 1; transform: scaleX(1); }
            50% { opacity: 0.5; transform: scaleX(0.95); }
          }
          @keyframes page-fold {
            0%, 100% { transform: rotateY(0deg); }
            50% { transform: rotateY(5deg); }
          }
          .line-1 { animation: line-appear 3s ease-in-out infinite; }
          .line-2 { animation: line-appear 3s ease-in-out infinite 0.5s; }
          .page-corner {
            animation: page-fold 4s ease-in-out infinite;
            transform-origin: right;
          }
        `}
      </style>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#800080" />
      <path className="page-corner" d="M14 2v6h6" fill="#C38BBF" fillOpacity="0.6" />
      <rect className="line-1" x="8" y="12" width="8" height="1.5" rx="0.5" fill="white" />
      <rect className="line-2" x="8" y="15" width="6" height="1.5" rx="0.5" fill="white" />
    </svg>
  )
}
