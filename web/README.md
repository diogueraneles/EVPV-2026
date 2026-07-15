# Eles Votam por Você — site (frontend)

Site público em **Next.js** que lê os dados direto do **Supabase** (só leitura, via
RLS público) e é servido por CDN. Mostra como cada deputado e senador vota, tema a tema.

## Estrutura

```
web/
  app/                     páginas (App Router)
    page.tsx               home + busca
    pessoas/               lista e perfil do parlamentar
    politicas/             lista e detalhe do tema (ranking)
    votacoes/[id]/         detalhe de uma votação
    partidos/[id]/         posição do partido por tema
    metodologia/ sobre/    páginas de confiança
  components/              Navbar, Footer, ScoreBadge, PersonCard, filtros
  lib/                     cliente Supabase, tipos, helpers
```

Os dados vêm de _views_ criadas no Supabase (`person_directory`, `score_named`,
`party_policy_agreement`, `division_vote`, etc.), todas com `security_invoker` — ou
seja, respeitam o RLS de leitura pública.

---

## Rodar localmente (opcional)

Pré-requisito: Node 18+.

```bash
cd web
npm install
npm run dev
# abre http://localhost:3000
```

As credenciais públicas já vêm no `.env.local`. Elas são seguras no navegador: a
chave é _publishable_ e o banco só permite leitura.

---

## Publicar (passo a passo)

### 1) Subir a pasta `web/` para o GitHub

O site vive dentro do mesmo repositório `EVPV-2026`, na pasta `web/`. Suba o
conteúdo dela (o `.gitignore` já evita subir `node_modules` e `.env`).

### 2) Criar o projeto na Vercel

1. Acesse https://vercel.com e entre com o GitHub.
2. **Add New… → Project** e importe o repositório `EVPV-2026`.
3. Em **Root Directory**, clique em *Edit* e selecione **`web`**.
4. Framework: **Next.js** (a Vercel detecta sozinho).

### 3) Configurar as variáveis de ambiente

Em **Environment Variables**, adicione as duas (valores públicos):

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rvcfbklnwglmhoxfexvj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_wCW4N2e7ZIR94Mm0nGJsCQ_2LaHIWl_` |

### 4) Deploy

Clique em **Deploy**. Em ~1–2 minutos sai um endereço `https://<projeto>.vercel.app`.
Cada `git push` novo redeploya automaticamente.

### 5) Domínio próprio (quando quiser)

Em **Settings → Domains**, adicione seu domínio e siga as instruções de DNS.

### 6) Cloudflare na frente (opcional, mais proteção)

Coloque o domínio na Cloudflare (proxy laranja) para cache extra e proteção
contra DDoS/WAF.

---

## Segurança

- A chave usada no site é **publishable** (feita para o navegador). O RLS do banco
  garante que só é possível **ler**, nunca escrever.
- Segredos de escrita (senha do Postgres, `service_role`) **nunca** entram aqui —
  ficam só nos GitHub Secrets / `.env` da ingestão.
