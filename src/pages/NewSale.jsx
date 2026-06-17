import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Search, User, CreditCard, DollarSign, Check } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import Card, { CardContent } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import styles from './NewSale.module.css'

const NewSale = () => {
  const { products, registerSale, getProductById } = useData()
  const { success, error } = useToast()
  const navigate = useNavigate()

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [salePrice, setSalePrice] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const availableProducts = products.filter(p => p.quantity > 0)

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setSalePrice(product.sale_price.toString())
    setQuantity(1)
    setProductModalOpen(false)
    setSearchTerm('')
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (selectedProduct?.quantity || 1)) {
      setQuantity(newQuantity)
    }
  }

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1
    const maxQty = selectedProduct?.quantity || 1
    setQuantity(Math.min(Math.max(1, value), maxQty))
  }

  const calculateTotal = () => {
    const price = parseFloat(salePrice) || 0
    return price * quantity
  }

  const calculateProfit = () => {
    if (!selectedProduct) return 0
    const total = calculateTotal()
    const cost = selectedProduct.cost_price * quantity
    return total - cost
  }

  const handleSubmit = async () => {
    if (!selectedProduct) {
      error('Erro', 'Selecione um produto')
      return
    }

    if (quantity < 1) {
      error('Erro', 'Quantidade inválida')
      return
    }

    const saleData = {
      productId: selectedProduct.id,
      quantity,
      salePrice: parseFloat(salePrice),
      paymentMethod,
      customerName: customerName.trim() || null
    }

    setLoading(true)
    try {
      const result = await registerSale(saleData)
      if (result.success) {
        success('Venda registrada!', `Venda de ${selectedProduct.name} concluída`)
        navigate('/vendas')
      } else {
        error('Erro', result.error)
      }
    } catch (err) {
      error('Erro', 'Falha ao registrar venda')
    } finally {
      setLoading(false)
      setConfirmModalOpen(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const paymentMethods = [
    { id: 'cash', label: 'Dinheiro', icon: <DollarSign size={16} /> },
    { id: 'credit', label: 'Crédito', icon: <CreditCard size={16} /> },
    { id: 'debit', label: 'Débito', icon: <CreditCard size={16} /> },
    { id: 'pix', label: 'PIX', icon: <DollarSign size={16} /> },
  ]

  return (
    <div className={styles.container}>
      {/* Seleção de Produto */}
      <Card variant="elevated" padding="medium">
        <CardContent>
          <div className={styles.productSelection}>
            {selectedProduct ? (
              <div className={styles.selectedProduct}>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{selectedProduct.name}</h3>
                  {selectedProduct.batch && (
                    <span className={styles.productBatch}>
                      Lote: {selectedProduct.batch}
                    </span>
                  )}
                  <span className={styles.productStock}>
                    Estoque: {selectedProduct.quantity} unid.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setProductModalOpen(true)}
                >
                  Trocar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setProductModalOpen(true)}
                leftIcon={<Search size={18} />}
              >
                Selecionar Produto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade */}
      {selectedProduct && (
        <>
          <Card variant="elevated" padding="medium">
            <CardContent>
              <label className={styles.label}>Quantidade</label>
              <div className={styles.quantityControl}>
                <button
                  className={styles.qtyButton}
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={20} />
                </button>
                
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInput}
                  min="1"
                  max={selectedProduct.quantity}
                  className={styles.qtyInput}
                />
                
                <button
                  className={styles.qtyButton}
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedProduct.quantity}
                >
                  <Plus size={20} />
                </button>
              </div>
              <span className={styles.maxQty}>
                Máximo disponível: {selectedProduct.quantity}
              </span>
            </CardContent>
          </Card>

          {/* Preço de Venda */}
          <Card variant="elevated" padding="medium">
            <CardContent>
              <Input
                type="number"
                label="Preço Unitário (R$)"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                step="0.01"
                min="0"
                leftIcon={<DollarSign size={18} />}
              />
            </CardContent>
          </Card>

          {/* Forma de Pagamento */}
          <Card variant="elevated" padding="medium">
            <CardContent>
              <label className={styles.label}>Forma de Pagamento</label>
              <div className={styles.paymentMethods}>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    className={`${styles.paymentButton} ${paymentMethod === method.id ? styles.active : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nome do Cliente */}
          <Card variant="elevated" padding="medium">
            <CardContent>
              <Input
                label="Nome do Cliente (opcional)"
                placeholder="Digite o nome do cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                leftIcon={<User size={18} />}
              />
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card variant="filled" padding="medium" className={styles.summaryCard}>
            <CardContent>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Lucro estimado</span>
                <span className={styles.profit}>
                  {formatCurrency(calculateProfit())}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botão Finalizar */}
          <Button
            variant="success"
            size="large"
            fullWidth
            onClick={() => setConfirmModalOpen(true)}
            disabled={loading}
            leftIcon={<Check size={20} />}
          >
            Finalizar Venda
          </Button>
        </>
      )}

      {/* Modal de Seleção de Produto */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setSearchTerm('')
        }}
        title="Selecionar Produto"
        size="large"
      >
        <div className={styles.searchContainer}>
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            autoFocus
          />
        </div>

        <div className={styles.productList}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyProducts}>
              Nenhum produto disponível
            </div>
          ) : (
            filteredProducts.map(product => (
              <button
                key={product.id}
                className={styles.productItem}
                onClick={() => handleProductSelect(product)}
              >
                <div className={styles.productItemInfo}>
                  <span className={styles.productItemName}>{product.name}</span>
                  <span className={styles.productItemDetails}>
                    {product.batch && `Lote: ${product.batch} • `}
                    Estoque: {product.quantity}
                  </span>
                </div>
                <span className={styles.productItemPrice}>
                  {formatCurrency(product.sale_price)}
                </span>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Venda"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={handleSubmit}
              loading={loading}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {selectedProduct && (
          <div className={styles.confirmDetails}>
            <div className={styles.confirmRow}>
              <span>Produto:</span>
              <strong>{selectedProduct.name}</strong>
            </div>
            <div className={styles.confirmRow}>
              <span>Quantidade:</span>
              <strong>{quantity} unid.</strong>
            </div>
            <div className={styles.confirmRow}>
              <span>Preço unitário:</span>
              <strong>{formatCurrency(parseFloat(salePrice) || 0)}</strong>
            </div>
            <div className={styles.confirmRow}>
              <span>Forma de pagamento:</span>
              <strong>
                {paymentMethods.find(m => m.id === paymentMethod)?.label}
              </strong>
            </div>
            {customerName && (
              <div className={styles.confirmRow}>
                <span>Cliente:</span>
                <strong>{customerName}</strong>
              </div>
            )}
            <div className={`${styles.confirmRow} ${styles.total}`}>
              <span>Total:</span>
              <strong>{formatCurrency(calculateTotal())}</strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NewSale