import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import StatCard from '../components/StatCard'
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card'
import Button from '../components/Button'
import Loading from '../components/Loading'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { user } = useAuth()
  const { 
    products, 
    sales,
    dashboardData, 
    loadingDashboard, 
    loadDashboardData,
    loadProducts,
    loadSales
  } = useData()
  const { error } = useToast()
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadProducts(), loadDashboardData(), loadSales()])
    } catch (err) {
      error('Erro', 'Falha ao carregar dados do dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'dd/MM HH:mm')
  }

  // Ordenar vendas por data (mais recentes primeiro)
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5) // Mostrar apenas as 5 mais recentes

  if (loadingDashboard && products.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading fullScreen text="Carregando dashboard..." />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Boas-vindas */}
      <div className={styles.welcome}>
        <h2 className={styles.welcomeTitle}>
          Olá, {user?.email?.split('@')[0] || 'Usuário'}!
        </h2>
        <p className={styles.welcomeSubtitle}>
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Package size={22} />}
          label="Total em Estoque"
          value={dashboardData.totalStock}
          unit="unid."
          color="primary"
          onClick={() => navigate('/produtos')}
        />

        <StatCard
          icon={<ShoppingCart size={22} />}
          label="Vendas Hoje"
          value={dashboardData.todaySales}
          unit="vendas"
          color="secondary"
          onClick={() => navigate('/vendas')}
        />

        <StatCard
          icon={<DollarSign size={22} />}
          label="Faturamento Hoje"
          value={formatCurrency(dashboardData.todayRevenue)}
          color="success"
          onClick={() => navigate('/relatorios')}
        />

        <StatCard
          icon={<TrendingUp size={22} />}
          label="Faturamento Mês"
          value={formatCurrency(dashboardData.monthRevenue)}
          color="warning"
          onClick={() => navigate('/relatorios')}
        />
      </div>

      {/* Ações Rápidas */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Ações Rápidas</h3>
        <div className={styles.actionsGrid}>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/vendas/nova')}
          >
            <ShoppingCart size={18} />
            Nova Venda
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/produtos/novo')}
          >
            <Package size={18} />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {(dashboardData.lowStockProducts.length > 0 || dashboardData.expiringProducts.length > 0) && (
        <div className={styles.alertsSection}>
          <h3 className={styles.sectionTitle}>
            <AlertTriangle size={18} />
            Alertas
          </h3>

          {dashboardData.lowStockProducts.length > 0 && (
            <Card variant="filled" padding="medium" className={styles.alertCard}>
              <CardContent>
                <div className={styles.alertHeader}>
                  <span className={`${styles.alertIcon} ${styles.warning}`}>
                    <Package size={16} />
                  </span>
                  <span className={styles.alertTitle}>
                    {dashboardData.lowStockProducts.length} produto(s) com estoque baixo
                  </span>
                </div>
                <ul className={styles.alertList}>
                  {dashboardData.lowStockProducts.slice(0, 3).map(product => (
                    <li key={product.id} className={styles.alertItem}>
                      <span className={styles.alertProductName}>{product.name}</span>
                      <span className={styles.alertProductQty}>
                        {product.quantity} unid.
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {dashboardData.expiringProducts.length > 0 && (
            <Card variant="filled" padding="medium" className={styles.alertCard}>
              <CardContent>
                <div className={styles.alertHeader}>
                  <span className={`${styles.alertIcon} ${styles.danger}`}>
                    <Clock size={16} />
                  </span>
                  <span className={styles.alertTitle}>
                    {dashboardData.expiringProducts.length} produto(s) próximos da validade
                  </span>
                </div>
                <ul className={styles.alertList}>
                  {dashboardData.expiringProducts.slice(0, 3).map(product => (
                    <li key={product.id} className={styles.alertItem}>
                      <span className={styles.alertProductName}>{product.name}</span>
                      <span className={styles.alertProductDate}>
                        Val: {format(new Date(product.expiry_date), 'dd/MM/yyyy')}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Últimas Vendas */}
      <div className={styles.recentSales}>
        <Card variant="elevated" padding="none">
          <CardHeader>
            <CardTitle>Últimas Vendas</CardTitle>
            <Button 
              variant="ghost" 
              size="small"
              onClick={() => navigate('/vendas')}
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {dashboardData.todaySales === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingCart size={32} />
                <p>Nenhuma venda registrada hoje</p>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={() => navigate('/vendas/nova')}
                >
                  Registrar venda
                </Button>
              </div>
            ) : (
              <div className={styles.salesList}>
                {recentSales.map(sale => {
                  const product = products.find(p => p.id === sale.product_id)
                  return (
                    <div key={sale.id} className={styles.saleItem}>
                      <div className={styles.saleInfo}>
                        <span className={styles.saleProduct}>
                          {product?.name || 'Produto'}
                        </span>
                        <span className={styles.saleDetails}>
                          {sale.quantity} unid. • {formatDateTime(sale.created_at)}
                        </span>
                      </div>
                      <span className={styles.saleAmount}>
                        {formatCurrency(sale.total_amount)}
                      </span>
                    </div>
                  )
                })}
                <p className={styles.salesSummary}>
                  {dashboardData.todaySales} venda(s) realizada(s) hoje
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botão de Atualizar */}
      <button 
        className={styles.refreshButton}
        onClick={loadData}
        disabled={refreshing}
        aria-label="Atualizar dashboard"
      >
        <span className={refreshing ? 'animate-spin' : ''}>
          🔄
        </span>
      </button>
    </div>
  )
}

export default Dashboard