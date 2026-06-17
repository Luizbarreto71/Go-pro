import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import styles from './Layout.module.css'

const Layout = ({ title, showBackButton = false, onBackClick }) => {
  return (
    <div className={styles.layout}>
      <Header 
        title={title} 
        showBackButton={showBackButton} 
        onBackClick={onBackClick}
      />
      
      <main className={styles.main}>
        <Outlet />
      </main>
      
      <Navigation />
      
      {/* Espaço para compensar a navegação fixa */}
      <div className={styles.spacer} />
    </div>
  )
}

export default Layout