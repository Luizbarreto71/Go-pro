import React from 'react'
import { Menu, Sun, Moon, LogOut, User, ChevronLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import styles from './Header.module.css'

const Header = ({ 
  title, 
  showBackButton = false, 
  onBackClick,
  onMenuClick 
}) => {
  const { user, signOut } = useAuth()
  const { theme, isDark, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBackButton && (
          <button 
            className={styles.iconButton} 
            onClick={onBackClick}
            aria-label="Voltar"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {onMenuClick && (
          <button 
            className={styles.iconButton} 
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        )}
        
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
          <div className={styles.userMenu}>
            <button
              className={styles.iconButton}
              onClick={handleSignOut}
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header