import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Verificar se é um ambiente de desenvolvimento
if (import.meta.env.DEV) {
  console.log('%c TG Control Pro ', 'background: #6366f1; color: white; font-size: 16px; padding: 8px; border-radius: 4px;')
  console.log('%c Sistema de Controle de Estoque e Vendas ', 'color: #6366f1; font-size: 12px;')
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.log('SW registration failed:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)