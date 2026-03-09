# Referência da API (Next.js Routes)

A API do **Inventário Ágil** é baseada em rotas do Next.js e utiliza autenticação via JWT/Session.

## 🔑 Autenticação

Todas as rotas (exceto login) exigem um token válido.
- Path: `/api/auth/*`
- Método: POST
- Retorno: `Set-Cookie` com a sessão ou Token JSON.

---

## 📦 Pedidos (`/api/orders`)

Gerencia o ciclo de vida dos pedidos de venda e transferências.

### `GET /api/orders`
Retorna a lista de todos os pedidos não arquivados.
- **Campos Principais**:
  - `id`: Prefixo `O-` seguido do ID numérico.
  - `status`: `RASCUNHO`, `ABERTO`, `EM_PICKING`, `FINALIZADO`, `CANCELADO`.
  - `readiness`: `NOT_READY`, `READY_PARTIAL`, `READY_FULL` (calculado via estoque).
  - `items`: Lista de materiais, quantidades e status de reserva.

### `POST /api/orders`
Cria um novo pedido (vazio ou com itens).
- **Payload**: `{ clientName: string, dueDate?: string, source?: 'manual'|'mrp' }`

---

## 🏗 Produção (`/api/production`)

Controla as ordens que precisam ser fabricadas.

### `GET /api/production`
Lista tarefas pendentes ou concluídas.
- **Filtros**: `status=PENDING`, `status=DONE`.

### `PATCH /api/production`
Atualiza o progresso de uma tarefa ou a marca como concluída.

---

## 📉 MRP (`/api/mrp-suggestions`)

Interface com o motor de inteligência artificial.

### `GET /api/mrp-suggestions`
Retorna as sugestões geradas pela última rodada da IA.
- **Campos**: `materialId`, `suggestedQty`, `reasoning` (explicação da IA), `status` (PENDING, APPROVED, REJECTED).

---

## 🔔 Notificações (`/api/notifications`)

Sistema de alertas interno (Inbox).

### `GET /api/notifications`
Retorna alertas de estoque baixo, rupturas e novas alocações.

---

## 📊 Indicadores (`/api/people-indicators`)

Dados para os dashboards de performance.
- Retorna métricas agregadas por dia/operador (Picking Rate, Lead Time Médio).

---

## 🛠 Notas Técnicas
- **Formato**: JSON.
- **Erros**: Retorna objeto `{ error: "mensagem" }` com status HTTP correspondente (401, 400, 500).
- **Realtime**: Algumas rotas disparam eventos via PubSub/Redis para atualização da UI sem refresh.
