import React from 'react'
import { Home, Package, ShoppingCart, BarChart3, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './Navigation.module.css'

const navItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/produtos', icon: Package, label: 'Produtos' },
  { path: '/vendas', icon: ShoppingCart, label: 'Vendas' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
]

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav} role="navigation" aria-label="Navegação principal">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path !== '/' && location.pathname.startsWith(item.path))
        const Icon = item.icon

        return (
          <button
            key={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon size={22} className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
            {isActive && <span className={styles.activeIndicator} />}
          </button>
        )
      })}
    </nav>
  )
}

export default Navigation