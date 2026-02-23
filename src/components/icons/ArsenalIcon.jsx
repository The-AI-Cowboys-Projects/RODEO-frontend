export default function ArsenalIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Scope/Crosshair icon */}
      <circle cx="12" cy="12" r="7" strokeWidth={2} />
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12h4" />
    </svg>
  )
}
