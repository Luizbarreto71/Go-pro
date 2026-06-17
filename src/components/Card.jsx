import React from 'react'
import styles from './Card.module.css'

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  hover = false,
  onClick,
  className = '',
  ...props
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hover ? styles.hover : '',
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={classNames} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header Component
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.cardHeader} ${className}`} {...props}>
      {children}
    </div>
  )
}

// Card Title Component
export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`${styles.cardTitle} ${className}`} {...props}>
      {children}
    </h3>
  )
}

// Card Content Component
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.cardContent} ${className}`} {...props}>
      {children}
    </div>
  )
}

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.cardFooter} ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card