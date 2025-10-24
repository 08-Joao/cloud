'use client'

import { Moon, Sun2 } from '@solar-icons/react/ssr'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
      setIsAnimating(false)
    }, 300)
  }

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-full text-secondary bg-card border border-border/20 shadow-lg backdrop-blur-xl"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  const isDarkMode = theme === 'dark'


  return (
    <div className="p-1 bg-elevation-2 rounded-lg">

    <button
      onClick={handleThemeToggle}
      className="p-2 rounded-full text-foreground bg-card border border-border/20 shadow-lg backdrop-blur-xl hover:bg-elevation-1 transition-all duration-300 hover:scale-110 active:scale-95"
    >
      <div
        className="relative"
        style={{
          transform: isAnimating ? 'rotate(360deg) scale(0.8)' : 'rotate(0deg) scale(1)',
          opacity: isAnimating ? 0.4 : 1,
          transition: 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        {isDarkMode ? <Moon weight='LineDuotone'/> : <Sun2 weight='LineDuotone'/> }
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
    </div>
  )
}
