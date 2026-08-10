# FlowDesk — SaaS de Gestão Empresarial (MVP)

FlowDesk é um sistema fullstack de gestão empresarial com:
- autenticação JWT + refresh token
- autorização por papéis (RBAC)
- Kanban de tarefas
- CRM de clientes, contatos e interações
- módulo de vendas e estatísticas
- notificações em tempo real com WebSocket
- Docker Compose para ambiente local integrado

Esta aplicação foi construída com:
- Backend: NestJS 10, Prisma, PostgreSQL, Redis, Socket.IO
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS
- Testes: Jest, Supertest

---

## Visão geral do projeto

O repositório é composto por duas pastas principais:

- `backend/`: API REST com lógica de negócio, autenticação e autorização.
- `frontend/`: interface web construída com Next.js.
- `docker-compose.yml`: orquestra Postgres, Redis, backend e frontend.

O backend expõe endpoints para tarefas, clientes, contatos, interações, vendas e autenticação. O frontend consome a API e apresenta dashboards, CRM e Kanban.

---

## Recursos implementados

### Autenticação e segurança
- Registro / login com senha hasheada via `bcrypt`
- Access token JWT com validade curta
- Refresh token JWT rotativo armazenado como hash no banco
- Logout que invalida o refresh token
- Proteção de rotas via `AuthGuard`

### Autorização (RBAC)
- Papéis: `ADMIN`, `MANAGER`, `EMPLOYEE`
- Guards e decoradores para proteger endpoints por papel
- Regras de negócio no serviço de tarefas: colaboradores só veem e alteram tarefas próprias

### Módulo de Tarefas (Kanban)
- CRUD completo de tarefas
- Fluxo de status e atualização por Kanban
- Reatribuição de tarefas com notificação em tempo real
- Filtragem por prioridade, status e responsável

### CRM e Vendas
- Gestão de clientes, contatos e interações
- Registro de vendas com status e valor
- Dashboard de vendas com gráficos de receita e status

### Notificações em tempo real
- WebSocket com `Socket.IO`
- Backend notifica usuário quando tarefa é reatribuída

---

## Como rodar o projeto

### Com Docker

```bash
docker compose up --build
```

A aplicação ficará disponível em:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

O `backend` executa automaticamente:
- `npx prisma db push --accept-data-loss`
- `npx prisma db seed`

### Sem Docker

#### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

> Se preferir, pode subir apenas Postgres e Redis via Docker com `docker compose up postgres redis`.

---

## Testes

### Backend

```bash
cd backend
npm run lint
npm test
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm run lint
```

---

## Usuários de teste

Estes usuários são criados pelo seed do backend:

| Email | Senha | Papel |
|---|---|---|
| `admin@flowdesk.com` | `Senha@123` | ADMIN |
| `manager@flowdesk.com` | `Senha@123` | MANAGER |
| `employee@flowdesk.com` | `Senha@123` | EMPLOYEE |

---

## Estrutura do repositório

```
flowdesk2/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── notifications/
│   │   ├── prisma/
│   │   ├── sales/
│   │   ├── tasks/
│   │   └── users/
│   ├── prisma/
│   └── test/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── docker-compose.yml
└── README.md
```

---

## Fluxo de CI

A pipeline de CI do GitHub Actions executa:
- `npm install`
- `npm run lint`
- `npx prisma generate`
- `npx prisma db push --accept-data-loss`
- `npm test -- --coverage`
- `npm run test:e2e`
- `npm run build` (frontend)

---

## Observações para avaliadores

- A solução demonstra backend e frontend integrados em um monorepo.
- Prisma é usado para modelagem de dados e geração de client.
- O projeto usa Docker Compose para facilitar ambiente local.
- A lógica de negócio valida papéis e permissões antes de executar ações.
- O frontend consome a API e apresenta funcionalidades de CRM e Kanban.

---

## Melhorias futuras

- Cobertura de testes E2E de UI com Cypress
- Autenticação social / SSO
- Relatórios avançados de vendas e funil
- Paginação e busca em listagens
