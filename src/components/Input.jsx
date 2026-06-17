import React, { forwardRef } from 'react'
import styles from './Input.module.css'

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  size = 'medium',
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const containerClasses = [
    styles.inputContainer,
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ')

  const inputClasses = [
    styles.input,
    styles[size],
    error ? styles.error : '',
    leftIcon ? styles.hasLeftIcon : '',
    rightIcon ? styles.hasRightIcon : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={styles.leftIcon}>{leftIcon}</span>
        )}
        
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <span className={styles.rightIcon}>{rightIcon}</span>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={styles.helperText} id={`${inputId}-error`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input