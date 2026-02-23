/**
 * OptimizedImage Component
 * Lazy-loaded images with blur placeholder and error handling
 */

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  objectFit = 'cover',
  placeholder = 'blur',
  fallbackSrc,
  onLoad,
  onError,
  lazy = true,
  priority = false,
}) {
  const { isDarkMode } = useTheme()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const imgRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading before it's in view
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, isInView])

  const handleLoad = (e) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleError = (e) => {
    setHasError(true)
    if (fallbackSrc && e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc
      setHasError(false)
    }
    if (onError) onError(e)
  }

  // Placeholder styles
  const placeholderStyles = {
    blur: `${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} animate-pulse`,
    solid: isDarkMode ? 'bg-slate-800' : 'bg-gray-100',
    none: '',
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 ${placeholderStyles[placeholder]}`}
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'}
          `}
          role="img"
          aria-label={`Failed to load: ${alt}`}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full
            ${objectFitClasses[objectFit]}
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </div>
  )
}

// Avatar component with optimized loading
export function Avatar({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  status,
  className = '',
}) {
  const { isDarkMode } = useTheme()
  const [hasError, setHasError] = useState(false)

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizes[size]} rounded-full overflow-hidden
          ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}
          flex items-center justify-center
        `}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getInitials(fallbackInitials || alt)}
          </span>
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2
            ${isDarkMode ? 'ring-slate-800' : 'ring-white'}
            ${statusColors[status]}
            ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

// Logo component with responsive sizing
export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: variant === 'full' ? 'h-6' : 'h-8',
    md: variant === 'full' ? 'h-8' : 'h-10',
    lg: variant === 'full' ? 'h-10' : 'h-12',
    xl: variant === 'full' ? 'h-12' : 'h-16',
  }

  return (
    <OptimizedImage
      src={variant === 'full' ? '/rodeo-logo.png' : '/rodeo-icon.png'}
      alt="R-O-D-E-O Security Platform"
      className={`${sizes[size]} w-auto ${className}`}
      objectFit="contain"
      priority
      fallbackSrc="/fallback-logo.svg"
    />
  )
}

// Thumbnail with loading state
export function Thumbnail({
  src,
  alt,
  size = 'md',
  rounded = 'md',
  className = '',
  onClick,
}) {
  const { isDarkMode } = useTheme()

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizes[size]}
        ${roundedClasses[rounded]}
        overflow-hidden
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}
        ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}
        ${className}
      `}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full"
        objectFit="cover"
      />
    </button>
  )
}
