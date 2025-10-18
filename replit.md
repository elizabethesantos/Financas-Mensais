# Controle Financeiro - Aplicação de Gerenciamento de Gastos

## Visão Geral
Aplicação web completa para gerenciamento financeiro pessoal, permitindo controle de gastos fixos e parcelados, visualização de vencimentos, e análise de dados financeiros através de dashboards interativos.

## Funcionalidades Principais

### 1. Dashboard
- Cards de métricas: Total Mensal, Pago, Pendente, Vencidos
- Gráfico de barras: Gastos por categoria
- Gráfico de linha: Evolução mensal de gastos
- Lista de próximos vencimentos

### 2. Gerenciamento de Gastos
- Listagem completa de todos os gastos
- Adicionar novos gastos (fixos ou parcelados)
- Editar gastos existentes
- Excluir gastos
- Status: Pago, Pendente, Vencido
- Tipos: Fixo (mensal recorrente) ou Parcelado

### 3. Calendário de Vencimentos
- Visualização em calendário mensal
- Indicadores visuais para datas com vencimentos
- Detalhamento de gastos por data selecionada
- Navegação entre meses

### 4. Relatórios
- Comparação mensal (mês atual vs anterior)
- Distribuição por categoria (gráfico de pizza)
- Top 5 maiores gastos do mês
- Análise de tendências

## Tecnologias Utilizadas

### Frontend
- React com TypeScript
- Wouter (roteamento)
- TanStack Query (gerenciamento de estado e cache)
- Recharts (visualização de dados)
- Shadcn UI (componentes)
- Tailwind CSS (estilização)
- date-fns (manipulação de datas)

### Backend
- Node.js com Express
- PostgreSQL (banco de dados)
- Drizzle ORM
- Zod (validação)

## Estrutura do Projeto

### Banco de Dados
Tabela `expenses`:
- id: identificador único
- name: nome do gasto
- value: valor em decimal
- category: categoria do gasto
- dueDate: data de vencimento
- type: 'fixed' (fixo) ou 'installment' (parcelado)
- totalInstallments: número total de parcelas (null para fixos)
- paidInstallments: parcelas já pagas
- status: 'paid', 'pending', ou 'overdue'
- createdAt: data de criação

### API Endpoints

#### Gastos
- GET `/api/expenses` - Listar todos os gastos
- GET `/api/expenses/:id` - Buscar gasto por ID
- GET `/api/expenses/range/:startDate/:endDate` - Gastos por período
- GET `/api/expenses/status/:status` - Gastos por status
- POST `/api/expenses` - Criar novo gasto
- PUT `/api/expenses/:id` - Atualizar gasto
- DELETE `/api/expenses/:id` - Excluir gasto

#### Analytics
- GET `/api/analytics/by-category` - Totais por categoria
- GET `/api/analytics/monthly/:months` - Totais mensais

## Configuração e Execução

### Desenvolvimento
```bash
npm run dev
```

### Banco de Dados
```bash
npm run db:push
```

## Características de Design

- Interface em português brasileiro
- Modo claro e escuro
- Design responsivo (mobile, tablet, desktop)
- Sidebar de navegação colapsável
- Estados de loading e empty states
- Validação de formulários
- Confirmação de ações destrutivas
- Feedback visual com toasts

## Páginas
1. **Dashboard** (`/`) - Visão geral e métricas
2. **Gastos** (`/gastos`) - Gerenciamento de gastos
3. **Vencimentos** (`/vencimentos`) - Calendário de vencimentos
4. **Relatórios** (`/relatorios`) - Análises e comparações

## Categorias Disponíveis
- Moradia
- Alimentação
- Transporte
- Saúde
- Educação
- Lazer
- Serviços
- Outros
