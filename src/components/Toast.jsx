import React, { useState, useEffect, useCallback } from 'react'
import { createContext, useContext } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import styles from './Toast.module.css'

// Contexto do Toast
const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now()
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remover toast após duração
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ))
  }, [])

  // Métodos de atalho
  const success = useCallback((title, message, duration) => {
    return addToast({ type: 'success', title, message, duration })
  }, [addToast])

  const error = useCallback((title, message, duration) => {
    return addToast({ type: 'error', title, message, duration })
  }, [addToast])

  const warning = useCallback((title, message, duration) => {
    return addToast({ type: 'warning', title, message, duration })
  }, [addToast])

  const info = useCallback((title, message, duration) => {
    return addToast({ type: 'info', title, message, duration })
  }, [addToast])

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  )
}

// Toast Item
const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }, [onClose])

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  }

  return (
    <div 
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
    >
      <div className={styles.icon}>
        {icons[toast.type]}
      </div>
      
      <div className={styles.content}>
        {toast.title && <div className={styles.title}>{toast.title}</div>}
        {toast.message && <div className={styles.message}>{toast.message}</div>}
      </div>
      
      <button 
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Export default do ToastContainer (componente principal)
export default ToastContainer
