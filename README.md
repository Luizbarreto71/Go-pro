# TG Control Pro

Sistema completo de controle de estoque e vendas, otimizado para uso mobile (mobile-first) e instalado como PWA (Progressive Web App).

## 🚀 Funcionalidades

- **Login/Cadastro** com autenticação segura via Supabase
- **Dashboard** com indicadores de desempenho
- **Cadastro de Produtos** com controle de lote, validade e preços
- **Controle de Estoque** com entradas, saídas e ajustes
- **Controle de Vendas** com baixa automática do estoque
- **Relatórios** diários, mensais e por produto
- **Alertas** de estoque baixo e produtos próximos da validade
- **Tema Escuro/Claro** com detecção automática de preferência
- **PWA** instalável no iPhone e Android

## 🛠️ Tecnologias

- **React 18** - Framework UI
- **Vite** - Build tool e dev server
- **React Router v6** - Roteamento
- **Supabase** - Backend (Auth, Database, Hosting)
- **Recharts** - Gráficos e relatórios
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **CSS Modules** - Estilização

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)

## 🔧 Instalação

### 1. Clone o repositório

```bash
cd tg-control-pro
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Configure o banco de dados no Supabase

1. Acesse o [Supabase](https://supabase.com) e crie um novo projeto
2. Vá para o **SQL Editor** no painel do Supabase
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Execute o script para criar as tabelas, índices e políticas de segurança

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📱 Como usar como PWA

### No iPhone (iOS)

1. Abra o aplicativo no Safari
2. Toque no botão **Compartilhar** (quadrado com seta)
3. Role para baixo e toque em **Adicionar à Tela de Início**
4. Toque em **Adicionar** no canto superior direito

### No Android

1. Abra o aplicativo no Chrome
2. Toque no menu (três pontos)
3. Toque em **Adicionar à tela inicial**
4. Confirme tocando em **Adicionar**

## 🚀 Deploy para Produção

### Opção 1: Supabase Hosting (Recomendado)

1. **Build do projeto:**

```bash
npm run build
```

2. **Instale o Supabase CLI:**

```bash
npm install -g supabase
```

3. **Login no Supabase:**

```bash
supabase login
```

4. **Deploy:**

```bash
supabase link --project-ref seu-project-ref
supabase hosting deploy --dir dist
```

### Opção 2: Vercel

1. **Build do projeto:**

```bash
npm run build
```

2. **Instale a Vercel CLI:**

```bash
npm install -g vercel
```

3. **Deploy:**

```bash
vercel --prod
```

### Opção 3: Netlify

1. **Build do projeto:**

```bash
npm run build
```

2. **Instale a Netlify CLI:**

```bash
npm install -g netlify-cli
```

3. **Deploy:**

```bash
netlify deploy --prod --dir=dist
```

## 📁 Estrutura do Projeto

```
tg-control-pro/
├── public/
│   ├── manifest.webmanifest    # Configuração PWA
│   └── icons/                  # Ícones do PWA
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Header.jsx
│   │   ├── Input.jsx
│   │   ├── Layout.jsx
│   │   ├── Loading.jsx
│   │   ├── Modal.jsx
│   │   ├── Navigation.jsx
│   │   ├── StatCard.jsx
│   │   └── Toast.jsx
│   ├── contexts/               # Contextos React
│   │   ├── AuthContext.jsx     # Autenticação
│   │   └── DataContext.jsx     # Dados (produtos, vendas, estoque)
│   ├── hooks/                  # Hooks personalizados
│   │   └── useTheme.js         # Tema escuro/claro
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Dashboard.jsx       # Página inicial
│   │   ├── Login.jsx           # Login/Cadastro
│   │   ├── NewSale.jsx         # Nova venda
│   │   ├── Products.jsx        # Lista de produtos
│   │   └── Reports.jsx         # Relatórios
│   ├── services/
│   │   └── supabase.js         # Cliente Supabase e APIs
│   ├── styles/
│   │   └── globals.css         # Estilos globais e variáveis CSS
│   ├── App.jsx                 # Componente principal
│   └── main.jsx                # Ponto de entrada
├── .env.example                # Exemplo de variáveis de ambiente
├── index.html                  # HTML principal
├── package.json                # Dependências e scripts
├── supabase-schema.sql         # Schema do banco de dados
└── vite.config.js              # Configuração do Vite
```

## 🗄️ Schema do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

- **products** - Produtos do estoque
- **stock_movements** - Movimentações de entrada/saída
- **sales** - Registro de vendas

Todas as tabelas possuem Row Level Security (RLS) ativado, garantindo que cada usuário acesse apenas seus próprios dados.

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Proteção de rotas no frontend
- Variáveis de ambiente para credenciais

## 📊 APIs Disponíveis

O arquivo `src/services/supabase.js` contém todas as funções para interação com o banco de dados:

- `authAPI` - Login, cadastro, logout, recuperação de senha
- `productsAPI` - CRUD de produtos, busca por estoque baixo e validade
- `salesAPI` - CRUD de vendas, filtros por data
- `stockMovementsAPI` - Registro de movimentações
- `dashboardAPI` - Funções para indicadores do dashboard

## 🎨 Personalização

### Cores e Tema

Edite as variáveis CSS em `src/styles/globals.css`:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #06b6d4;
  --success-color: #10b981;
  /* ... outras cores */
}
```

### Ícones PWA

Substitua os ícones em `public/icons/` pelas suas imagens (PNG):
- icon-72.png
- icon-96.png
- icon-128.png
- icon-144.png
- icon-152.png
- icon-192.png
- icon-384.png
- icon-512.png

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

TG Control Pro - Sistema de Controle de Estoque e Vendas

---

**Dúvidas?** Abra uma issue ou entre em contato.