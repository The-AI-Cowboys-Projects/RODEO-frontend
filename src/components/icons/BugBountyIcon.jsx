export default function BugBountyIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bug body */}
      <ellipse cx="12" cy="13" rx="5" ry="6" stroke="currentColor" strokeWidth="1.5" />

      {/* Bug head */}
      <circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />

      {/* Antennae */}
      <path d="M10 4L8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 4L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Legs */}
      <path d="M7 10L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 13L4 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 16L4 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 10L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 13L20 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 16L20 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Target crosshair on bug */}
      <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M12 10V11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 15V16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M9 13H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 13H15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
