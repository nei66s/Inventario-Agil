# Contribuindo

Este projeto segue um fluxo simples de Git para manter o `main` sempre estável.

## Regra geral
- **Sempre crie uma branch nova** antes de iniciar mudanças.
- **Nunca commite direto no `main`**.

## Fluxo recomendado
1. Atualize o repositório:
   - `git pull`
2. Crie uma branch a partir do `main`:
   - `git checkout -b feature/nome-curto`
3. Faça as alterações e commits.
4. Suba a branch:
   - `git push -u origin feature/nome-curto`
5. Abra um PR para revisão e merge.

## Convenção de nomes de branch
- `feature/<descricao>` para novas funcionalidades
- `fix/<descricao>` para correções
- `chore/<descricao>` para manutenção interna

Se precisar de exceção (hotfix urgente em produção), documente no PR e mantenha o menor escopo possível.
