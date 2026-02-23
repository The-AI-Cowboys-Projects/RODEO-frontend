export default function RocketIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      {/* Rocket body */}
      <path d="M12 2c-3 3-5 8-5 12 0 2 1 4 2 5l3-3 3 3c1-1 2-3 2-5 0-4-2-9-5-12z" fill="#800080" />
      {/* Window */}
      <circle cx="12" cy="10" r="2" fill="white" />
      {/* Fins */}
      <path d="M7 14c-2 1-3 3-3 5l3-2v-3z" fill="#C38BBF" />
      <path d="M17 14c2 1 3 3 3 5l-3-2v-3z" fill="#C38BBF" />
      {/* Flame */}
      <path d="M10 19l2 3 2-3c-1 1-3 1-4 0z" fill="white" fillOpacity="0.7" />
    </svg>
  )
}
