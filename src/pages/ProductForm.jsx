import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Package, DollarSign, Calendar, Hash, FileText } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import Card, { CardContent } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Loading from '../components/Loading'
import styles from './ProductForm.module.css'

const ProductForm = () => {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const { createProduct, updateProduct, getProduct } = useData()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    concentration: '',
    batch: '',
    quantity: '',
    cost_price: '',
    sale_price: '',
    entry_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    observations: ''
  })

  useEffect(() => {
    if (isEditing) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      const result = await getProduct(id)
      if (result.success && result.data) {
        const product = result.data
        setFormData({
          name: product.name || '',
          concentration: product.concentration || '',
          batch: product.batch || '',
          quantity: product.quantity?.toString() || '0',
          cost_price: product.cost_price?.toString() || '',
          sale_price: product.sale_price?.toString() || '',
          entry_date: product.entry_date || new Date().toISOString().split('T')[0],
          expiry_date: product.expiry_date || '',
          observations: product.observations || ''
        })
      } else {
        error('Erro', 'Produto não encontrado')
        navigate('/produtos')
      }
    } catch (err) {
      error('Erro', 'Falha ao carregar produto')
      navigate('/produtos')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      error('Erro', 'Nome do produto é obrigatório')
      return false
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      error('Erro', 'Quantidade inválida')
      return false
    }
    if (!formData.cost_price || parseFloat(formData.cost_price) < 0) {
      error('Erro', 'Valor de custo inválido')
      return false
    }
    if (!formData.sale_price || parseFloat(formData.sale_price) < 0) {
      error('Erro', 'Valor de venda inválido')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const productData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        cost_price: parseFloat(formData.cost_price),
        sale_price: parseFloat(formData.sale_price),
        user_id: user.id
      }

      let result
      if (isEditing) {
        result = await updateProduct(id, productData)
      } else {
        result = await createProduct(productData)
      }

      if (result.success) {
        success(
          'Sucesso!',
          isEditing ? 'Produto atualizado com sucesso' : 'Produto cadastrado com sucesso'
        )
        navigate('/produtos')
      } else {
        error('Erro', result.error || 'Falha ao salvar produto')
      }
    } catch (err) {
      error('Erro', 'Ocorreu um erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/produtos')
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <Card variant="elevated" padding="medium">
          <CardContent>
            <h2 className={styles.title}>
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className={styles.formGrid}>
              {/* Nome */}
              <div className={styles.fullWidth}>
                <Input
                  label="Nome do Produto *"
                  placeholder="Digite o nome do produto"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  leftIcon={<Package size={18} />}
                  required
                />
              </div>

              {/* Concentração */}
              <div className={styles.halfWidth}>
                <Input
                  label="Concentração"
                  placeholder="Ex: 100ml, 500g"
                  name="concentration"
                  value={formData.concentration}
                  onChange={handleChange}
                  leftIcon={<FileText size={18} />}
                />
              </div>

              {/* Lote */}
              <div className={styles.halfWidth}>
                <Input
                  label="Lote"
                  placeholder="Número do lote"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  leftIcon={<Hash size={18} />}
                />
              </div>

              {/* Quantidade */}
              <div className={styles.halfWidth}>
                <Input
                  type="number"
                  label="Quantidade *"
                  placeholder="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  leftIcon={<Package size={18} />}
                  min="0"
                  required
                />
              </div>

              {/* Data de Entrada */}
              <div className={styles.halfWidth}>
                <Input
                  type="date"
                  label="Data de Entrada"
                  name="entry_date"
                  value={formData.entry_date}
                  onChange={handleChange}
                  leftIcon={<Calendar size={18} />}
                />
              </div>

              {/* Valor de Custo */}
              <div className={styles.halfWidth}>
                <Input
                  type="number"
                  label="Valor de Custo (R$) *"
                  placeholder="0,00"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  leftIcon={<DollarSign size={18} />}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Valor de Venda */}
              <div className={styles.halfWidth}>
                <Input
                  type="number"
                  label="Valor de Venda (R$) *"
                  placeholder="0,00"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  leftIcon={<DollarSign size={18} />}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Data de Validade */}
              <div className={styles.halfWidth}>
                <Input
                  type="date"
                  label="Data de Validade"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  leftIcon={<Calendar size={18} />}
                />
              </div>

              {/* Observações */}
              <div className={styles.fullWidth}>
                <Input
                  label="Observações"
                  placeholder="Informações adicionais sobre o produto"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  as="textarea"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            leftIcon={<X size={18} />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            leftIcon={<Save size={18} />}
          >
            {isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm