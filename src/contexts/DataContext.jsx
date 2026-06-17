import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { productsAPI, salesAPI, stockMovementsAPI } from '../services/supabase'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  
  // Estado de Produtos
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  
  // Estado de Vendas
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  
  // Estado de Movimentações
  const [movements, setMovements] = useState([])
  const [loadingMovements, setLoadingMovements] = useState(false)
  
  // Estado de Dashboard
  const [dashboardData, setDashboardData] = useState({
    totalStock: 0,
    todaySales: 0,
    todayRevenue: 0,
    monthSales: 0,
    monthRevenue: 0,
    lowStockProducts: [],
    expiringProducts: []
  })
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  // Carregar produtos
  const loadProducts = useCallback(async () => {
    if (!user) return
    try {
      setLoadingProducts(true)
      const { data, error } = await productsAPI.getProducts(user.id)
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoadingProducts(false)
    }
  }, [user])

  // Carregar vendas
  const loadSales = useCallback(async (startDate = null, endDate = null) => {
    if (!user) return
    try {
      setLoadingSales(true)
      const { data, error } = await salesAPI.getSales(user.id, startDate, endDate)
      if (error) throw error
      setSales(data || [])
    } catch (err) {
      console.error('Erro ao carregar vendas:', err)
    } finally {
      setLoadingSales(false)
    }
  }, [user])

  // Carregar movimentações
  const loadMovements = useCallback(async () => {
    if (!user) return
    try {
      setLoadingMovements(true)
      const { data, error } = await stockMovementsAPI.getUserMovements(user.id)
      if (error) throw error
      setMovements(data || [])
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err)
    } finally {
      setLoadingMovements(false)
    }
  }, [user])

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    if (!user) return
    try {
      setLoadingDashboard(true)
      
      // Carregar produtos com estoque baixo
      const { data: lowStock } = await productsAPI.getLowStockProducts(user.id, 10)
      
      // Carregar produtos próximos da validade
      const { data: expiring } = await productsAPI.getExpiringProducts(user.id, 30)
      
      // Carregar vendas de hoje
      const { data: todaySales } = await salesAPI.getTodaySales(user.id)
      
      // Carregar vendas do mês
      const { data: monthSales } = await salesAPI.getMonthSales(user.id)
      
      // Calcular totais
      const todayRevenue = todaySales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
      const monthRevenue = monthSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
      
      // Calcular total em estoque
      const totalStock = products.reduce((sum, product) => sum + (product.quantity || 0), 0)
      
      setDashboardData({
        totalStock,
        todaySales: todaySales?.length || 0,
        todayRevenue,
        monthSales: monthSales?.length || 0,
        monthRevenue,
        lowStockProducts: lowStock || [],
        expiringProducts: expiring || []
      })
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoadingDashboard(false)
    }
  }, [user, products])

  // Criar produto
  const createProduct = useCallback(async (productData) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }
    try {
      const { data, error } = await productsAPI.createProduct({
        ...productData,
        user_id: user.id
      })
      if (error) throw error
      
      // Adicionar produto à lista local
      setProducts(prev => [data[0], ...prev])
      
      // Registrar movimentação de entrada
      if (productData.quantity > 0) {
        await stockMovementsAPI.createMovement({
          user_id: user.id,
          product_id: data[0].id,
          type: 'entry',
          quantity: productData.quantity,
          observation: 'Cadastro inicial do produto'
        })
      }
      
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [user])

  // Atualizar produto
  const updateProduct = useCallback(async (productId, updates) => {
    try {
      const { data, error } = await productsAPI.updateProduct(productId, updates)
      if (error) throw error
      
      // Atualizar produto na lista local
      setProducts(prev => prev.map(p => p.id === productId ? data[0] : p))
      
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Deletar produto
  const deleteProduct = useCallback(async (productId) => {
    try {
      const { error } = await productsAPI.deleteProduct(productId)
      if (error) throw error
      
      // Remover produto da lista local
      setProducts(prev => prev.filter(p => p.id !== productId))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Registrar entrada de estoque
  const registerStockEntry = useCallback(async (productId, quantity, observation = '') => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }
    try {
      // Atualizar quantidade do produto
      const product = products.find(p => p.id === productId)
      if (!product) throw new Error('Produto não encontrado')
      
      const newQuantity = product.quantity + quantity
      
      const { error: updateError } = await productsAPI.updateProduct(productId, {
        quantity: newQuantity
      })
      if (updateError) throw updateError
      
      // Registrar movimentação
      const { error: movementError } = await stockMovementsAPI.createMovement({
        user_id: user.id,
        product_id: productId,
        type: 'entry',
        quantity: quantity,
        observation: observation || 'Entrada de estoque'
      })
      if (movementError) throw movementError
      
      // Atualizar lista local
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [user, products])

  // Registrar saída de estoque
  const registerStockExit = useCallback(async (productId, quantity, observation = '') => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }
    try {
      // Atualizar quantidade do produto
      const product = products.find(p => p.id === productId)
      if (!product) throw new Error('Produto não encontrado')
      if (product.quantity < quantity) throw new Error('Quantidade insuficiente em estoque')
      
      const newQuantity = product.quantity - quantity
      
      const { error: updateError } = await productsAPI.updateProduct(productId, {
        quantity: newQuantity
      })
      if (updateError) throw updateError
      
      // Registrar movimentação
      const { error: movementError } = await stockMovementsAPI.createMovement({
        user_id: user.id,
        product_id: productId,
        type: 'exit',
        quantity: quantity,
        observation: observation || 'Saída de estoque'
      })
      if (movementError) throw movementError
      
      // Atualizar lista local
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [user, products])

  // Registrar venda
  const registerSale = useCallback(async (saleData) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }
    try {
      const { productId, quantity, salePrice, paymentMethod, customerName } = saleData
      
      // Verificar produto e estoque
      const product = products.find(p => p.id === productId)
      if (!product) throw new Error('Produto não encontrado')
      if (product.quantity < quantity) throw new Error('Quantidade insuficiente em estoque')
      
      // Calcular total
      const totalAmount = quantity * salePrice
      const profit = totalAmount - (quantity * product.cost_price)
      
      // Criar venda
      const { data: saleDataResult, error: saleError } = await salesAPI.createSale({
        user_id: user.id,
        product_id: productId,
        quantity,
        unit_price: salePrice,
        total_amount: totalAmount,
        profit,
        payment_method: paymentMethod,
        customer_name: customerName || null
      })
      if (saleError) throw saleError
      
      // Atualizar quantidade do produto
      const newQuantity = product.quantity - quantity
      const { error: updateError } = await productsAPI.updateProduct(productId, {
        quantity: newQuantity
      })
      if (updateError) throw updateError
      
      // Registrar movimentação de saída
      const { error: movementError } = await stockMovementsAPI.createMovement({
        user_id: user.id,
        product_id: productId,
        type: 'sale',
        quantity: quantity,
        observation: `Venda #${saleDataResult[0].id}`,
        sale_id: saleDataResult[0].id
      })
      if (movementError) throw movementError
      
      // Atualizar listas locais
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p))
      setSales(prev => [saleDataResult[0], ...prev])
      
      return { success: true, data: saleDataResult[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [user, products])

  // Carregar produto por ID
  const getProductById = useCallback((productId) => {
    return products.find(p => p.id === productId)
  }, [products])

  // Resetar dados ao fazer logout
  useEffect(() => {
    if (!isAuthenticated) {
      setProducts([])
      setSales([])
      setMovements([])
      setDashboardData({
        totalStock: 0,
        todaySales: 0,
        todayRevenue: 0,
        monthSales: 0,
        monthRevenue: 0,
        lowStockProducts: [],
        expiringProducts: []
      })
    }
  }, [isAuthenticated])

  const value = {
    // Produtos
    products,
    loadingProducts,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    
    // Vendas
    sales,
    loadingSales,
    loadSales,
    registerSale,
    
    // Movimentações
    movements,
    loadingMovements,
    loadMovements,
    registerStockEntry,
    registerStockExit,
    
    // Dashboard
    dashboardData,
    loadingDashboard,
    loadDashboardData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContext