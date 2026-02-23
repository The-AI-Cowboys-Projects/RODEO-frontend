import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('rodeo_dark_mode')
    return stored !== null ? stored === 'true' : true
  })

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('rodeo_dark_mode', isDarkMode.toString())

    // Apply to document root
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const setTheme = (darkMode) => {
    setIsDarkMode(darkMode)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
