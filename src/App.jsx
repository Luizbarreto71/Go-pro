import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ToastProvider } from './components/Toast'
import { useTheme } from './hooks/useTheme'

// Páginas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import NewSale from './pages/NewSale'
import Reports from './pages/Reports'

// Componentes de Layout
import Layout from './components/Layout'

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-family)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// App Router
const AppRouter = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Rota de Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } 
      />

      {/* Rotas Protegidas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout title="TG Control Pro" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      <Route 
        path="/produtos" 
        element={
          <ProtectedRoute>
            <Layout title="Produtos" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Products />} />
        <Route path="novo" element={<ProductForm />} />
        <Route path=":id" element={<ProductForm />} />
      </Route>

      <Route 
        path="/vendas" 
        element={
          <ProtectedRoute>
            <Layout title="Vendas" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Products />} />
        <Route path="nova" element={<NewSale />} />
      </Route>

      <Route 
        path="/relatorios" 
        element={
          <ProtectedRoute>
            <Layout title="Relatórios" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Reports />} />
      </Route>

      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Componente Principal
function App() {
  // Inicializar tema
  useTheme()

  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}

export default App