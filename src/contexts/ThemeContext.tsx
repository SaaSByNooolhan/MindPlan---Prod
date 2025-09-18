import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuthContext } from './AuthContext'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext()
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Réinitialiser le thème quand l'utilisateur change
  useEffect(() => {
    if (user) {
      // Charger le thème spécifique à l'utilisateur
      const userThemeKey = `theme_${user.id}`
      const saved = localStorage.getItem(userThemeKey)
      if (saved) {
        setIsDark(saved === 'dark')
      }
    } else {
      // Si pas d'utilisateur, utiliser le thème par défaut
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [user])

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to localStorage avec l'ID utilisateur
    if (user) {
      const userThemeKey = `theme_${user.id}`
      localStorage.setItem(userThemeKey, isDark ? 'dark' : 'light')
    } else {
      // Fallback pour les utilisateurs non connectés
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }, [isDark, user])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}