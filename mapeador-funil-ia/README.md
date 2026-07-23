# Mapeador de Funil IA

Cliente preenche um formulário de mapeamento de processo comercial em linguagem simples; uma IA (Anthropic) transforma as respostas na estrutura técnica de um ou mais funis de CRM (etapas, gatilhos, tarefas, campos, SLA, regras, responsável, automação, script).

## Stack

- React + TypeScript + Vite
- Supabase (Postgres + Auth + RLS + Edge Functions)
- Anthropic API (dentro da Edge Function `gerar-funil`)

## Rotas

- `/login` — autenticação por e-mail/senha
- `/` — dashboard com os mapeamentos do usuário
- `/novo` — wizard de mapeamento (aceita `?id=` para retomar um rascunho)
- `/mapeamento/:id` — respostas + funil gerado (kanban/tabela), ou botão para gerar

## Setup

```bash
npm install
cp .env.example .env
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

### Banco de dados

Rode a migration em `supabase/migrations/0001_init.sql` no seu projeto Supabase (SQL editor ou `supabase db push`). Ela cria `mapeamentos`, `funis_gerados`, `campos_padrao` com RLS por `user_id`.

### Edge Function `gerar-funil`

```bash
supabase functions deploy gerar-funil
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# opcional: supabase secrets set ANTHROPIC_MODEL=claude-sonnet-4-6
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são injetadas automaticamente pelo runtime de Edge Functions do Supabase.

A função:
1. Busca o mapeamento e monta as respostas em texto legível.
2. Chama a Anthropic com o system prompt do arquiteto de funis.
3. Em caso de JSON inválido, tenta novamente uma vez pedindo apenas JSON.
4. Grava um registro em `funis_gerados` por funil identificado e atualiza `mapeamentos.status`.
