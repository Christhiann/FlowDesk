# FlowDesk — SaaS de Gestão Empresarial

🔗 **Aplicação no ar:** [flow-desk-red-theta.vercel.app](https://flow-desk-red-theta.vercel.app)
📚 **Documentação da API (Swagger):** [flowdesk-cq5g.onrender.com/docs](https://flowdesk-cq5g.onrender.com/docs)

> O backend está no plano gratuito do Render, que "dorme" após 15 min sem uso.
> Se a primeira tela demorar ~30-50s pra carregar, é isso — é esperado, não é bug.

**Usuários de teste** (para explorar sem precisar criar conta):

| E-mail | Senha | Papel |
|---|---|---|
| admin@flowdesk.com | Senha@123 | Admin |
| manager@flowdesk.com | Senha@123 | Manager |
| employee@flowdesk.com | Senha@123 | Employee |

Sistema completo de gestão com autenticação JWT, autorização por papéis (RBAC),
Kanban de tarefas, CRM, dashboard com gráficos de vendas, notificações em
tempo real via WebSocket e testes automatizados (unitários, e2e de API e
e2e de UI com Cypress) — construído com Next.js, NestJS, Prisma e PostgreSQL,
deployado em Vercel + Render + Supabase.

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts · Socket.IO Client |
| Backend | NestJS 10 · TypeScript · Passport JWT · Prisma · Socket.IO |
| Banco | PostgreSQL (Supabase) |
| Testes | Jest · Supertest · Cypress |
| Infra | Docker · Docker Compose · GitHub Actions (CI) · Vercel · Render |

## Funcionalidades

**Autenticação**
- Cadastro e login com senha hasheada (bcrypt)
- Access token JWT (15 min) + refresh token JWT (7 dias) rotativo, em cookie `httpOnly`
- Logout com invalidação de sessão no servidor
- Recuperação de senha com token de expiração

**Autorização (RBAC)**
- Três papéis: `ADMIN`, `MANAGER`, `EMPLOYEE`
- Guards por rota + regras de negócio no serviço (ex: colaborador só move as próprias tarefas)

**Tarefas (Kanban)**
- Criação, edição, exclusão e reatribuição
- Drag-and-drop nativo entre colunas (A fazer → Em andamento → Revisão → Concluído)
- Prioridade, prazo, responsável

**CRM**
- Clientes, contatos e histórico de interações (ligação, e-mail, reunião, nota)
- Acesso restrito a Admin/Manager

**Vendas e Dashboard**
- Registro de vendas por cliente, com status (prospect → qualificação → negociação → ganha/perdida)
- Gráficos de faturamento mensal e distribuição por status (Recharts)

**Notificações em tempo real**
- WebSocket (Socket.IO) autenticado por JWT
- Alerta instantâneo quando uma tarefa é reatribuída ao usuário

**Qualidade**
- Testes unitários (regras de RBAC) e e2e de API (Jest + Supertest)
- Testes e2e de interface com Cypress (login, Kanban, CRM)
- CI no GitHub Actions rodando lint, testes e build a cada push

---
