import { useState, useEffect, useCallback } from 'react'

export const useTheme = () => {
  // Inicializar tema baseado na preferência do sistema ou localStorage
  const [theme, setTheme] = useState(() => {
    // Verificar localStorage
    const savedTheme = localStorage.getItem('tg-control-theme')
    if (savedTheme) {
      return savedTheme
    }
    // Verificar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  // Aplicar tema ao DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tg-control-theme', theme)
    
    // Atualizar cor da tema do meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#f8fafc')
    }
  }, [theme])

  // Alternar entre temas
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }, [])

  // Definir tema específico
  const setThemeMode = useCallback((newTheme) => {
    setTheme(newTheme)
  }, [])

  // Ouvinte para mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Apenas se não houver tema salvo no localStorage
      if (!localStorage.getItem('tg-control-theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setThemeMode
  }
}

export default useTheme