import React from 'react'
import { Loader2 } from 'lucide-react'
import styles from './Button.module.css'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={styles.spinner} size={size === 'small' ? 16 : 20} />
      ) : leftIcon ? (
        <span className={styles.iconLeft}>{leftIcon}</span>
      ) : null}
      
      <span className={styles.text}>{children}</span>
      
      {rightIcon && !loading && (
        <span className={styles.iconRight}>{rightIcon}</span>
      )}
    </button>
  )
}

export default Button