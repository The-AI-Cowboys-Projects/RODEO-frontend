import { createContext, useContext, useState, useEffect } from 'react'

const DemoModeContext = createContext()

export const useDemoMode = () => {
  const context = useContext(DemoModeContext)
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider')
  }
  return context
}

// Seeded random number generator (mulberry32) for stable demo data
function createSeededRandom(seed) {
  let t = seed + 0x6D2B79F5
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const stored = localStorage.getItem('rodeo_demo_mode')
    return stored !== null ? stored === 'true' : true // default ON
  })

  useEffect(() => {
    localStorage.setItem('rodeo_demo_mode', isDemoMode.toString())
  }, [isDemoMode])

  const toggleDemoMode = () => setIsDemoMode(prev => !prev)

  // Create a seeded random generator that produces the same values per page/key
  const seededRandom = (key, count = 1) => {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i)
      hash |= 0
    }
    const rng = createSeededRandom(Math.abs(hash))
    if (count === 1) return rng()
    return Array.from({ length: count }, () => rng())
  }

  // Generate a seeded integer in range [min, max]
  const seededInt = (key, min, max) => {
    const r = seededRandom(key)
    return Math.floor(r * (max - min + 1)) + min
  }

  // Generate an array of seeded integers
  const seededIntArray = (keyPrefix, count, min, max) => {
    return Array.from({ length: count }, (_, i) => {
      const r = seededRandom(`${keyPrefix}_${i}`)
      return Math.floor(r * (max - min + 1)) + min
    })
  }

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      setDemoMode: setIsDemoMode,
      seededRandom,
      seededInt,
      seededIntArray,
    }}>
      {children}
    </DemoModeContext.Provider>
  )
}
