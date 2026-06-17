import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Package } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../components/Toast'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import styles from './Login.module.css'

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { signIn, signUp, isAuthenticated, user } = useAuth()
  const { isDark } = useTheme()
  const { success, error } = useToast()
  const navigate = useNavigate()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido'
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }

    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      if (isSignUp) {
        const result = await signUp(email, password)
        if (result.success) {
          success('Conta criada!', 'Bem-vindo ao TG Control Pro')
          navigate('/')
        } else {
          error('Erro no cadastro', result.error)
        }
      } else {
        const result = await signIn(email, password)
        if (result.success) {
          success('Bem-vindo!', 'Login realizado com sucesso')
          navigate('/')
        } else {
          error('Erro no login', result.error)
        }
      }
    } catch (err) {
      error('Erro', 'Ocorreu um erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={`${styles.logo} ${isDark ? styles.dark : ''}`}>
          <Package size={40} />
        </div>
        <h1 className={styles.title}>TG Control Pro</h1>
        <p className={styles.subtitle}>
          {isSignUp ? 'Crie sua conta' : 'Faça login para continuar'}
        </p>
      </div>

      <Card className={styles.card} padding="large">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail size={18} />}
            autoComplete="email"
            required
          />

          <div className={styles.passwordField}>
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              rightIcon={
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {isSignUp && (
            <Input
              type="password"
              label="Confirmar Senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock size={18} />}
              autoComplete="new-password"
              required
            />
          )}

          {!isSignUp && (
            <div className={styles.forgotPassword}>
              <button 
                type="button" 
                className={styles.forgotLink}
                onClick={() => {/* Implementar recuperação de senha */}}
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <Button 
            type="submit" 
            fullWidth 
            size="large" 
            loading={loading}
          >
            {isSignUp ? 'Criar conta' : 'Entrar'}
          </Button>
        </form>
      </Card>

      <div className={styles.footer}>
        <p className={styles.switchText}>
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
        </p>
        <button
          className={styles.switchButton}
          onClick={() => {
            setIsSignUp(!isSignUp)
            setErrors({})
          }}
        >
          {isSignUp ? 'Fazer login' : 'Cadastrar-se'}
        </button>
      </div>
    </div>
  )
}

export default Login