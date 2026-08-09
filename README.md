# FlowDesk — SaaS de Gestão Empresarial (MVP funcional)

Sistema completo de gestão com autenticação, autorização por papéis (RBAC),
módulo de tarefas Kanban, CRM mínimo, vendas, notificações em tempo real,
Docker e deploy-ready.

Este projeto mostra uma stack fullstack funcional: backend NestJS + Prisma,
frontend Next.js + Tailwind, e Docker Compose para criar um ambiente local
integrado.

## O que foi alterado / implementado
- Adicionado suporte a CRM no backend com modelos Prisma:
  `Customer`, `Contact`, `Interaction`, `Sale`.
- Criadas APIs REST de CRUD para clientes, contatos, interações e vendas.
- Atualizado o frontend com telas de CRM e dashboards de vendas.
- Incluídos gráficos de receita e status de vendas via `recharts`.
- Adicionada funcionalidade de notificações em tempo real via WebSocket
  (`Socket.IO`) para reatribuição de tarefas.
- A seed foi ajustada para popular dados de teste e evitar buscas por campos não únicos.
- O Docker Compose agora sobe toda a stack e executa `prisma db push` + seed no backend.
- Adicionado suporte de roles e regras de negócio: colaboradores só alteram tarefas
  próprias; admin/manager gerenciam tudo.

## O que já funciona
- Autenticação completa com email/senha e tokens JWT
- Refresh token em cookie `httpOnly` e rotativo
- Logout com invalidação de refresh token
- Permissões RBAC para rotas e operações de negócio
- Board Kanban de tarefas com criação, edição, reatribuição e status
- CRM básico de clientes, contatos e histórico de interações
- Gestão de vendas com `Sale`, status e visualização de estatísticas
- Notificações realtime para reatribuição de tarefa
- Testes E2E de interface de usuário com Cypress
- Containerização com Docker Compose

## O que ainda falta
- Nenhum item crítico de front-end; foco em melhorias incrementais e cobertura adicional de testes

## Stack

| Camada       | Tecnologias |
|--------------|-------------|
| Frontend     | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Backend      | NestJS 10 · TypeScript · Passport JWT · Prisma |
| Banco        | PostgreSQL |
| Cache        | Redis |
| WebSocket    | Socket.IO |
| Testes       | Jest · Supertest |
| Infra        | Docker · Docker Compose |

## Funcionalidades

**Autenticação**
- Cadastro e login com senha hasheada (bcrypt)
- Access token JWT (15 min) + refresh token JWT (7 dias)
- Refresh token armazenado como hash no banco
- Logout que invalida refresh token
- Recuperação de senha com token de expiração

**Autorização (RBAC)**
- Papéis: `ADMIN`, `MANAGER`, `EMPLOYEE`
- Guards com `@Roles(...)`
- Regras adicionais no serviço: colaboradores só vêem e movem tarefas próprias

**Tarefas (Kanban)**
- Criação, edição, exclusão e reatribuição de tarefas
- Colunas: A fazer → Em andamento → Revisão → Concluído
- Prioridade, descrição, prazo, responsável
- Drag-and-drop para mover tarefas entre colunas

**CRM e Vendas**
- Clientes com contatos e histórico de interações
- Vendas associadas a clientes e usuários
- Dashboard de vendas com gráficos de receita e status

**Notificações em tempo real**
- WebSocket de backend para enviar alertas quando tarefa é reatribuída
- Frontend preparado para receber eventos de notificação

## Rodando localmente com Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Swagger: http://localhost:3001/docs

O `docker-compose.yml` sobe Postgres, Redis, backend e frontend. O backend
executa `prisma db push` e `prisma db seed` automaticamente.

## Rodando sem Docker

**Backend**
```bash
cd backend
cp .env.example .env      # ajuste DATABASE_URL se necessário
npm install
npx prisma migrate dev    # cria as tabelas
npx prisma db seed        # popula dados de teste
npm run start:dev
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Você precisa de um Postgres rodando localmente ou pode subir apenas o banco
via Docker: `docker compose up postgres redis`.

## Usuários de teste (criados pelo seed)

| E-mail                  | Senha       | Papel       |
|--------------------------|-------------|-------------|
| admin@flowdesk.com       | Senha@123   | Admin       |
| manager@flowdesk.com     | Senha@123   | Manager     |
| employee@flowdesk.com    | Senha@123   | Employee    |

## Testes

```bash
cd backend
npm test           # unitários
npm run test:e2e   # testes de integração/backend
```

## Deploy sugerido

1. Configure um Postgres em Railway/Supabase.
2. Faça deploy do backend apontando `DATABASE_URL`, `JWT_ACCESS_SECRET`,
   `JWT_REFRESH_SECRET` e `FRONTEND_URL`.
3. Execute `npx prisma migrate deploy` no backend.
4. Faça deploy do frontend no Vercel com `NEXT_PUBLIC_API_URL` apontando para o backend.

## Estrutura do projeto

```
flowdesk/
├── backend/            # API NestJS
│   ├── src/
│   │   ├── auth/       # registro, login, refresh, RBAC
│   │   ├── users/
│   │   ├── tasks/
│   │   ├── customers/
│   │   ├── sales/
│   │   ├── notifications/
│   │   └── prisma/
│   ├── prisma/         # schema.prisma + seed.js
│   └── test/           # testes e2e
├── frontend/           # Next.js App Router
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
├── docker-compose.yml
└── README.md
```

## O que o projeto prova
- Construção de API segura com autenticação JWT e refresh token rotativo
- Autorização por papéis com regras de negócio no backend
- Desenvolvimento de board Kanban e CRM integrado
- Uso de Prisma para modelagem de dados e seed de teste
- Containerização da aplicação com Docker Compose

## Roadmap (ainda não implementado)

- Testes E2E de UI com Cypress
