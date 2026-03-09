# Guia de Troubleshooting

Se você encontrar problemas rodando o **Inventário Ágil**, consulte as soluções comuns listadas abaixo.

## 🛠 Erros de Build & TypeScript

### `Error: Cannot find module '...'`
- **Causa**: Alguma dependência não foi instalada ou deletada.
- **Solução**: 
  1. `rm -rf node_modules package-lock.json` (ou use PowerShell para deletar).
  2. `npm install`.

### `Typecheck fails on PR build`
- **Causa**: Alguma alteração quebrou contratos de tipos ou props.
- **Solução**: `npm run typecheck` localmente e corrija as ocorrências no código.

## 🗄 Problemas de Banco de Dados (PostgreSQL)

### `Could not connect to database...`
- **Causa**: Host do PG indisponível, credenciais erradas ou firewall.
- **Solução**:
  1. Verifique `DATABASE_URL` no `.env`.
  2. Teste via script: `node scripts/test-db.js`.

### `Relation "xxxx" does not exist`
- **Causa**: Tabelas não foram criadas ou migrações pendentes.
- **Solução**: Rode `npm run db:migrate`.

## ⚡ Conectividade & Real-time (Redis & WS)

### `Real-time offline`
- **Causa**: Servidor WebSocket configurado no `NEXT_PUBLIC_WS_URL` não responde ou Redis está fora do ar.
- **Solução**:
  1. Verifique se o Redis está acessível.
  2. No browser, abra o Console de Dev (F12) e veja se há erros de `Network` para o servidor WS.

### `Dashboard data not updating` (Cache issue)
- **Causa**: O Redis de cache pode estar com dados obsoletos ou o barramento PubSub falhou.
- **Solução**: 
  1. Use o script de limpeza de cache: `npm run clear-cache` (se disponível).
  2. Ou limpe manualmente no Redis: `FLUSHALL`.

## 🏭 Erros de Negócio (MRP & Produção)

### `MRP Suggestion is missing material details`
- **Causa**: Material existe como sugestão mas não está cadastrado formalmente na tabela de `materials`.
- **Solução**: Garanta que o material foi seeded corretamente em `scripts/seed-legacy-materials.js`.

---
*Para outros problemas, abra uma Issue no repositório ou poste uma pergunta nas discussões da equipe.*
