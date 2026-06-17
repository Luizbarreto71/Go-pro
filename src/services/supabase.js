import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
// Estas variáveis devem ser definidas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Funções de Autenticação
export const authAPI = {
  // Login com email e senha
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Cadastro com email e senha
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          created_at: new Date().toISOString()
        }
      }
    })
    return { data, error }
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Recuperação de senha
  async resetPasswordForEmail(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Obter sessão atual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Obter usuário atual
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Atualizar senha
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  },

  // Ouvinte de mudanças na autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funções de Produtos
export const productsAPI = {
  // Criar produto
  async createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...product,
        created_at: new Date().toISOString()
      }])
      .select()
    return { data, error }
  },

  // Listar todos os produtos do usuário
  async getProducts(userId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Obter produto por ID
  async getProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Atualizar produto
  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Deletar produto
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Buscar produtos com estoque baixo
  async getLowStockProducts(userId, threshold = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .lte('quantity', threshold)
      .order('quantity', { ascending: true })
    return { data, error }
  },

  // Buscar produtos próximos da validade
  async getExpiringProducts(userId, days = 30) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .lte('expiry_date', expiryDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .order('expiry_date', { ascending: true })
    return { data, error }
  }
}

// Funções de Movimentações de Estoque
export const stockMovementsAPI = {
  // Criar movimentação
  async createMovement(movement) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([{
        ...movement,
        created_at: new Date().toISOString()
      }])
      .select()
    return { data, error }
  },

  // Listar movimentações de um produto
  async getProductMovements(productId) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Listar todas as movimentações do usuário
  async getUserMovements(userId, limit = 50) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(name, batch)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  }
}

// Funções de Vendas
export const salesAPI = {
  // Criar venda
  async createSale(sale) {
    const { data, error } = await supabase
      .from('sales')
      .insert([{
        ...sale,
        created_at: new Date().toISOString()
      }])
      .select()
    return { data, error }
  },

  // Listar vendas do usuário
  async getSales(userId, startDate = null, endDate = null) {
    let query = supabase
      .from('sales')
      .select(`
        *,
        product:products(name, batch, cost_price, sale_price)
      `)
      .eq('user_id', userId)
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  // Obter venda por ID
  async getSale(id) {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products(name, batch, cost_price, sale_price)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Vendas de hoje
  async getTodaySales(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
    return { data, error }
  },

  // Vendas do mês
  async getMonthSales(userId) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
    return { data, error }
  }
}

// Funções de Dashboard/Relatórios
export const dashboardAPI = {
  // Total em estoque
  async getTotalStock(userId) {
    const { data, error } = await supabase.rpc('get_total_stock', { user_id_param: userId })
    return { data, error }
  },

  // Faturamento do dia
  async getDailyRevenue(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase.rpc('get_daily_revenue', { 
      user_id_param: userId, 
      date_param: today.toISOString() 
    })
    return { data, error }
  },

  // Faturamento do mês
  async getMonthlyRevenue(userId) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data, error } = await supabase.rpc('get_monthly_revenue', {
      user_id_param: userId,
      start_date_param: startOfMonth.toISOString()
    })
    return { data, error }
  },

  // Produtos mais vendidos
  async getTopProducts(userId, limit = 10) {
    const { data, error } = await supabase.rpc('get_top_products', {
      user_id_param: userId,
      limit_param: limit
    })
    return { data, error }
  }
}