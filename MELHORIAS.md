# Melhorias — Eles Votam Por Você

Análise de 2026-07-06. Prioridade: **A** = fazer logo, **B** = próximo ciclo, **C** = quando escalar.

## A. Build & CI

1. **Não há CI de testes** — os workflows só fazem ingestão. Criar `.github/workflows/ci.yml` rodando em PR/push: `ruff check`, `python scoring/score.py --self-test`, `python -m api.test_api` (ou pytest). Hoje uma regressão só aparece na carga diária.
2. **Dependências sem pin** (`requests>=2.31` etc.) — builds não reprodutíveis. Adotar `pyproject.toml` + lockfile (uv ou pip-tools): `requirements.in` → `requirements.txt` pinado. O workflow diário instala versões novas todo dia sem aviso.
3. **Migrar psycopg2-binary → psycopg 3** (`psycopg[binary,pool]`): pool com health-check embutido (o `ThreadedConnectionPool` atual não detecta conexões mortas — o pooler do Supabase derruba conexões ociosas e a API devolve erro 500 até reciclar).
4. **Deduplicar código de ingestão**: `get_json`, `VOTE_MAP/ORIENT_MAP`, `BLOCS` e todos os upserts estão copiados em 3–4 arquivos. Extrair `ingest/common.py` (HTTP com retry) e `ingest/db_upserts.py`. Hoje um fix de retry precisa ser aplicado 3×.

## A. Debugging & Observabilidade

5. **Falha silenciosa do job diário**: se o workflow quebrar, ninguém fica sabendo. Adicionar step `if: failure()` que abre issue no repo (ou manda e-mail). É a melhoria de maior retorno imediato.
6. **Substituir prints por `logging`** (níveis, timestamps, `--verbose`). O contador `skipped` do ingest_camara engole a causa — logar o traceback em nível debug e um resumo das causas no final.
7. **Métricas de sanidade pós-carga**: ao fim do workflow diário, rodar as queries do `verify_pipeline.sh` e falhar/alertar se contagens caírem a zero num período que deveria ter sessão. Detecta mudança de formato da API da Câmara/Senado antes do usuário.
8. **Supabase advisors**: rodar periodicamente os advisors de segurança/performance do painel (ou via MCP) — pega índice faltante e RLS mal configurada.

## B. Testes

9. As funções `normalize_*` e `tally_by_party` são puras — testá-las com fixtures JSON gravadas das APIs reais (pytest + arquivos em `tests/fixtures/`). Protege contra regressão quando a Câmara mudar payload.
10. Converter `api/test_api.py` para pytest com `monkeypatch` (hoje substitui funções por atribuição global, o que vaza estado entre testes).
11. Teste de integração opcional em CI: Postgres como service container + `verify_pipeline.sh` com janela de 1 dia (marcar como manual/semanal para não depender das APIs externas em todo PR).

## B. Pipeline / Outcomes

12. **Encadear o enrich**: `enrich_propositions.py` só roda manual. Adicionar como step do daily-ingest (após a ingestão) — sem ele as votações ficam sem assunto, e o assunto é essencial para curadoria e para o site.
13. **`is_nominal` por heurística** (`len(votos) > 0`): documentar limite conhecido — votação nominal cujo `/votos` retornou 404/vazio vira "simbólica". O enrich ou uma re-checagem posterior pode corrigir.
14. **Senado `ABSENCE_CODES`**: manter um log de códigos de voto não mapeados (contagem de `outro`) para expandir o mapa com dados reais.
15. **Frontend não existe ainda** — é o próximo grande outcome. Caminho de menor atrito: Next.js/SvelteKit consumindo a API FastAPI (ou direto o Supabase com RLS de leitura já aplicada), deploy em Vercel/Cloudflare Pages. As views/tabelas (`agreement_score`, `party_agreement`, `party_vote_tally`) já entregam o que as páginas precisam.
16. **Curadoria de políticas** é o coração do produto (o seed é só exemplo mecânico). Criar fluxo mínimo: tabela/planilha de curadoria → SQL de import, ou um admin simples. Sem políticas reais, os scores não significam nada.

## B. API

17. Sem cache: dados mudam 1×/dia — adicionar `Cache-Control: public, max-age=3600` nas rotas GET (e depois um CDN na frente). Corta custo e latência.
18. Paginação sem metadados: retornar `total` ou header `X-Total-Count` para o frontend paginar.
19. `occurred_at` sai como `str | datetime` dependendo do caminho — padronizar serialização (Pydantic `datetime`).
20. Rate limiting simples (slowapi) se a API ficar pública sem chave.

## C. Setup / Infra

21. `.env.example` expõe o project-ref real do Supabase (`rvcfbklnwglmhoxfexvj`) — inofensivo sozinho, mas melhor usar placeholder.
22. Healthcheck (`/health`) da API no ambiente onde ela for hospedada.
23. Fixar `postgres:16` está ok; revisar versões de actions (`checkout@v4`, `setup-python@v5`) 1×/semestre.
24. Quando o volume crescer: índice em `division(house, occurred_at)` composto para a listagem, e `EXPLAIN` nas queries do `_CURRENT_PARTY_JOIN` (LATERAL por pessoa é O(n) subqueries — se pesar, materializar o partido atual via `derive_memberships`, que aliás já existe: a API poderia usar `party_membership` em vez do LATERAL).

## Pontos fortes (manter)

Idempotência ponta a ponta (UPSERT em tudo, schema com IF NOT EXISTS), commit por votação com rollback isolado, dry-run nos ingestores, self-test da lógica de score sem banco, bulk por arquivos anuais para backfill, separação clara ingestão/score/API, docs honestos sobre IPv4/IPv6 do Supabase.
