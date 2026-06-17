import React from 'react'
import { Loader2 } from 'lucide-react'
import styles from './Loading.module.css'

const Loading = ({
  size = 'medium',
  fullScreen = false,
  text = '',
  className = ''
}) => {
  const content = (
    <div className={`${styles.loading} ${styles[size]} ${className}`}>
      <Loader2 className={styles.spinner} size={size === 'small' ? 20 : size === 'large' ? 40 : 32} />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        {content}
      </div>
    )
  }

  return content
}

// Loading Overlay Component
export const LoadingOverlay = ({ loading, children, text = '' }) => {
  if (!loading) return children

  return (
    <div className={styles.overlayContainer}>
      {children}
      <div className={styles.overlay}>
        <Loading size="large" text={text} />
      </div>
    </div>
  )
}

export default Loading