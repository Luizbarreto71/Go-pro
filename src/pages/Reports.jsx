import React, { useEffect, useState } from 'react'
import { BarChart3, Calendar, DollarSign, Package, TrendingUp, Download } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card'
import Button from '../components/Button'
import Loading from '../components/Loading'
import StatCard from '../components/StatCard'
import styles from './Reports.module.css'

const Reports = () => {
  const { sales, products, movements, loadSales, loadProducts, loadingSales } = useData()
  const { error } = useToast()
  const [activeTab, setActiveTab] = useState('daily')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadSales(), loadProducts()])
    } catch (err) {
      error('Erro', 'Falha ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Calcular dados do relatório diário
  const getDailyData = () => {
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      const daySales = sales.filter(s => 
        format(new Date(s.created_at), 'yyyy-MM-dd') === dateStr
      )
      
      const totalRevenue = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0)
      const totalProfit = daySales.reduce((sum, s) => sum + (s.profit || 0), 0)
      
      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: format(date, "dd 'de' MMMM", { locale: ptBR }),
        revenue: totalRevenue,
        profit: totalProfit,
        sales: daySales.length
      }
    })
    
    return last7Days
  }

  // Calcular dados do relatório mensal
  const getMonthlyData = () => {
    const currentMonth = sales.filter(s => {
      const saleDate = new Date(s.created_at)
      return saleDate.getMonth() === new Date().getMonth() &&
             saleDate.getFullYear() === new Date().getFullYear()
    })
    
    const totalRevenue = currentMonth.reduce((sum, s) => sum + (s.total_amount || 0), 0)
    const totalProfit = currentMonth.reduce((sum, s) => sum + (s.profit || 0), 0)
    const totalSales = currentMonth.length
    
    return { totalRevenue, totalProfit, totalSales }
  }

  // Produtos mais vendidos
  const getTopProducts = () => {
    const productSales = {}
    
    sales.forEach(sale => {
      const productName = sale.product?.name || 'Produto Desconhecido'
      if (!productSales[productName]) {
        productSales[productName] = { quantity: 0, revenue: 0 }
      }
      productSales[productName].quantity += sale.quantity || 0
      productSales[productName].revenue += sale.total_amount || 0
    })
    
    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }

  const dailyData = getDailyData()
  const monthlyData = getMonthlyData()
  const topProducts = getTopProducts()

  const tabs = [
    { id: 'daily', label: 'Diário', icon: <Calendar size={16} /> },
    { id: 'monthly', label: 'Mensal', icon: <BarChart3 size={16} /> },
    { id: 'products', label: 'Produtos', icon: <Package size={16} /> },
  ]

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

  if (loading && sales.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading fullScreen text="Carregando relatórios..." />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Relatório Diário */}
      {activeTab === 'daily' && (
        <div className={styles.reportContent}>
          <div className={styles.statsGrid}>
            <StatCard
              icon={<DollarSign size={22} />}
              label="Faturamento Hoje"
              value={formatCurrency(dailyData[6]?.revenue || 0)}
              color="success"
            />
            <StatCard
              icon={<TrendingUp size={22} />}
              label="Lucro Hoje"
              value={formatCurrency(dailyData[6]?.profit || 0)}
              color="primary"
            />
            <StatCard
              icon={<BarChart3 size={22} />}
              label="Vendas Hoje"
              value={dailyData[6]?.sales || 0}
              unit="vendas"
              color="secondary"
            />
          </div>

          <Card variant="elevated" padding="none">
            <CardHeader>
              <CardTitle>Faturamento - Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" name="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Lucro" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório Mensal */}
      {activeTab === 'monthly' && (
        <div className={styles.reportContent}>
          <div className={styles.statsGrid}>
            <StatCard
              icon={<DollarSign size={22} />}
              label="Faturamento Mês"
              value={formatCurrency(monthlyData.totalRevenue)}
              color="success"
            />
            <StatCard
              icon={<TrendingUp size={22} />}
              label="Lucro Mês"
              value={formatCurrency(monthlyData.totalProfit)}
              color="primary"
            />
            <StatCard
              icon={<BarChart3 size={22} />}
              label="Vendas Mês"
              value={monthlyData.totalSales}
              unit="vendas"
              color="secondary"
            />
          </div>

          <Card variant="elevated" padding="medium">
            <CardContent>
              <h3 className={styles.sectionTitle}>Resumo do Mês</h3>
              <div className={styles.monthlySummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Ticket Médio</span>
                  <span className={styles.summaryValue}>
                    {monthlyData.totalSales > 0 
                      ? formatCurrency(monthlyData.totalRevenue / monthlyData.totalSales)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Margem de Lucro</span>
                  <span className={`${styles.summaryValue} ${styles.profitMargin}`}>
                    {monthlyData.totalRevenue > 0
                      ? `${((monthlyData.totalProfit / monthlyData.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório por Produtos */}
      {activeTab === 'products' && (
        <div className={styles.reportContent}>
          <Card variant="elevated" padding="none">
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package size={48} />
                  <p>Nenhuma venda registrada</p>
                </div>
              ) : (
                <>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={topProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="quantity"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} unidades`,
                            props.payload.name
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.topProductsList}>
                    {topProducts.map((product, index) => (
                      <div key={product.name} className={styles.topProductItem}>
                        <span className={styles.productRank}>#{index + 1}</span>
                        <div className={styles.productInfo}>
                          <span className={styles.productName}>{product.name}</span>
                          <span className={styles.productDetails}>
                            {product.quantity} unid. vendidas
                          </span>
                        </div>
                        <span className={styles.productRevenue}>
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão de Atualizar */}
      <button 
        className={styles.refreshButton}
        onClick={loadData}
        disabled={loading}
        aria-label="Atualizar relatórios"
      >
        <span className={loading ? 'animate-spin' : ''}>🔄</span>
      </button>
    </div>
  )
}

export default Reports