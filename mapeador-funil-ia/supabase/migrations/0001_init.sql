-- Mapeador de Funil IA — schema inicial

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- mapeamentos: cada preenchimento de formulário
-- ─────────────────────────────────────────────
create table if not exists public.mapeamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome_negocio text,
  status text not null default 'em_preenchimento'
    check (status in ('em_preenchimento', 'processando_ia', 'concluido', 'erro')),
  respostas jsonb not null default '{}'::jsonb,
  erro_detalhe text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mapeamentos_user_id_idx on public.mapeamentos(user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists mapeamentos_set_updated_at on public.mapeamentos;
create trigger mapeamentos_set_updated_at
  before update on public.mapeamentos
  for each row execute function public.set_updated_at();

alter table public.mapeamentos enable row level security;

create policy "mapeamentos_select_own" on public.mapeamentos
  for select using (auth.uid() = user_id);
create policy "mapeamentos_insert_own" on public.mapeamentos
  for insert with check (auth.uid() = user_id);
create policy "mapeamentos_update_own" on public.mapeamentos
  for update using (auth.uid() = user_id);
create policy "mapeamentos_delete_own" on public.mapeamentos
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- funis_gerados: output da IA para cada mapeamento
-- ─────────────────────────────────────────────
create table if not exists public.funis_gerados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mapeamento_id uuid not null references public.mapeamentos(id) on delete cascade,
  nome_funil text not null,
  tipo_funil text not null,
  justificativa text,
  etapas jsonb not null default '[]'::jsonb,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists funis_gerados_mapeamento_id_idx on public.funis_gerados(mapeamento_id);
create index if not exists funis_gerados_user_id_idx on public.funis_gerados(user_id);

alter table public.funis_gerados enable row level security;

create policy "funis_gerados_select_own" on public.funis_gerados
  for select using (auth.uid() = user_id);
create policy "funis_gerados_insert_own" on public.funis_gerados
  for insert with check (auth.uid() = user_id);
create policy "funis_gerados_update_own" on public.funis_gerados
  for update using (auth.uid() = user_id);
create policy "funis_gerados_delete_own" on public.funis_gerados
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- campos_padrao: biblioteca reutilizável de campos
-- (populada manualmente; leitura compartilhada entre usuários autenticados)
-- ─────────────────────────────────────────────
create table if not exists public.campos_padrao (
  id uuid primary key default gen_random_uuid(),
  entidade text not null check (entidade in ('LEAD', 'CONTATO')),
  nome_campo text not null,
  tipo text not null
    check (tipo in ('lista_suspensa', 'texto_curto', 'texto_longo', 'numero', 'data', 'checkbox', 'telefone')),
  opcoes jsonb,
  created_at timestamptz not null default now()
);

alter table public.campos_padrao enable row level security;

-- Leitura liberada para qualquer usuário autenticado (biblioteca compartilhada).
-- Escrita não é liberada via policy: apenas a service_role (que ignora RLS) grava aqui.
create policy "campos_padrao_select_authenticated" on public.campos_padrao
  for select using (auth.role() = 'authenticated');
