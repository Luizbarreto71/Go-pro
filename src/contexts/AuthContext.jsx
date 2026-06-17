import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar sessão ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { session, error } = await authAPI.getSession()
        if (error) throw error
        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Erro ao verificar sessão:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Ouvinte de mudanças na autenticação
    const { data: { subscription } } = authAPI.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login
  const signIn = useCallback(async (email, password) => {
    try {
      setError(null)
      const { data, error } = await authAPI.signIn(email, password)
      if (error) throw error
      setUser(data.user)
      setSession(data.session)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  // Cadastro
  const signUp = useCallback(async (email, password) => {
    try {
      setError(null)
      const { data, error } = await authAPI.signUp(email, password)
      if (error) throw error
      setUser(data.user)
      setSession(data.session)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  // Logout
  const signOut = useCallback(async () => {
    try {
      const { error } = await authAPI.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  // Recuperação de senha
  const resetPassword = useCallback(async (email) => {
    try {
      setError(null)
      const { data, error } = await authAPI.resetPasswordForEmail(email)
      if (error) throw error
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  // Atualizar senha
  const updatePassword = useCallback(async (newPassword) => {
    try {
      setError(null)
      const { data, error } = await authAPI.updatePassword(newPassword)
      if (error) throw error
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext