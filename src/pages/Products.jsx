import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Package, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import Card, { CardContent } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import styles from './Products.module.css'

const Products = () => {
  const { products, loadingProducts, loadProducts, deleteProduct } = useData()
  const { success, error, warning } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const handleDelete = async () => {
    if (!productToDelete) return
    
    try {
      const result = await deleteProduct(productToDelete.id)
      if (result.success) {
        success('Produto excluído', 'O produto foi removido com sucesso')
      } else {
        error('Erro', result.error)
      }
    } catch (err) {
      error('Erro', 'Falha ao excluir produto')
    } finally {
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const confirmDelete = (product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batch?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterLowStock ? product.quantity <= 10 : true
    
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Esgotado', class: styles.outOfStock }
    if (quantity <= 10) return { label: 'Estoque baixo', class: styles.lowStock }
    return { label: 'Em estoque', class: styles.inStock }
  }

  if (loadingProducts && products.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading fullScreen text="Carregando produtos..." />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Barra de Busca e Filtros */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            size="medium"
          />
        </div>
        
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filterLowStock ? styles.active : ''}`}
            onClick={() => setFilterLowStock(!filterLowStock)}
          >
            <AlertTriangle size={16} />
            Estoque Baixo
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className={styles.productsList}>
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} />
            <h3>Nenhum produto encontrado</h3>
            <p>
              {searchTerm || filterLowStock 
                ? 'Tente ajustar os filtros de busca'
                : 'Cadastre seu primeiro produto'}
            </p>
            {!searchTerm && !filterLowStock && (
              <Button
                variant="primary"
                onClick={() => navigate('/produtos/novo')}
              >
                <Plus size={18} />
                Cadastrar Produto
              </Button>
            )}
          </div>
        ) : (
          filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.quantity)
            
            return (
              <Card 
                key={product.id} 
                variant="elevated" 
                padding="medium"
                className={styles.productCard}
              >
                <CardContent>
                  <div className={styles.productHeader}>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      {product.batch && (
                        <span className={styles.productBatch}>
                          Lote: {product.batch}
                        </span>
                      )}
                      {product.concentration && (
                        <span className={styles.productConcentration}>
                          {product.concentration}
                        </span>
                      )}
                    </div>
                    
                    <span className={`${styles.stockStatus} ${stockStatus.class}`}>
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className={styles.productDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Quantidade</span>
                      <span className={styles.detailValue}>
                        {product.quantity} unid.
                      </span>
                    </div>
                    
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Custo</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(product.cost_price)}
                      </span>
                    </div>
                    
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Venda</span>
                      <span className={`${styles.detailValue} ${styles.salePrice}`}>
                        {formatCurrency(product.sale_price)}
                      </span>
                    </div>
                    
                    {product.expiry_date && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Validade</span>
                        <span className={styles.detailValue}>
                          {format(new Date(product.expiry_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.productActions}>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate(`/produtos/${product.id}`)}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate(`/produtos/${product.id}/saida`)}
                    >
                      <Package size={16} />
                      Saída
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => confirmDelete(product)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Botão Flutuante */}
      <button
        className={styles.fab}
        onClick={() => navigate('/produtos/novo')}
        aria-label="Adicionar produto"
      >
        <Plus size={24} />
      </button>

      {/* Botão de Atualizar */}
      <button 
        className={styles.refreshButton}
        onClick={handleRefresh}
        disabled={refreshing}
        aria-label="Atualizar lista"
      >
        <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
      </button>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Produto"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir o produto "{productToDelete?.name}"?
        </p>
        <p className={styles.modalWarning}>
          Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  )
}

export default Products