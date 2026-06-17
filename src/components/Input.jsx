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
  as,
  rows,
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
    rightIcon ? styles.hasRightIcon : '',
    as === 'textarea' ? styles.textarea : ''
  ].filter(Boolean).join(' ')

  // Se as for 'textarea', renderiza textarea, senão renderiza input
  const renderInput = () => {
    if (as === 'textarea') {
      return (
        <textarea
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          rows={rows || 3}
          {...props}
        />
      )
    }
    
    return (
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
    )
  }

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={`${styles.inputWrapper} ${as === 'textarea' ? styles.textareaWrapper : ''}`}>
        {leftIcon && as !== 'textarea' && (
          <span className={styles.leftIcon}>{leftIcon}</span>
        )}
        
        {renderInput()}
        
        {rightIcon && as !== 'textarea' && (
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