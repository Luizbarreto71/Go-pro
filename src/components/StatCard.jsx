import React from 'react'
import Card, { CardContent } from './Card'
import styles from './StatCard.module.css'

const StatCard = ({ 
  icon, 
  label, 
  value, 
  unit = '', 
  trend, 
  trendValue,
  color = 'primary',
  onClick 
}) => {
  return (
    <Card 
      variant={onClick ? 'default' : 'filled'} 
      padding="medium"
      hover={!!onClick}
      onClick={onClick}
      className={onClick ? styles.clickable : ''}
    >
      <CardContent className={styles.content}>
        <div className={`${styles.iconWrapper} ${styles[color]}`}>
          {icon}
        </div>
        
        <div className={styles.info}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>
            {value}
            {unit && <span className={styles.unit}>{unit}</span>}
          </span>
          
          {trend && (
            <span className={`${styles.trend} ${styles[trend]}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard