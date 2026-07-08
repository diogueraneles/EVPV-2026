#!/usr/bin/env python3
"""
Enriquecimento de ASSUNTO — Câmara dos Deputados
Projeto: Eles Votam Por Você

A lista /votacoes NÃO traz a proposição das votações de Plenário (o campo vem
vazio), mas o DETALHE /votacoes/{id} traz `proposicoesAfetadas` — o projeto/MP
efetivamente afetado, com ementa completa. Este script busca o detalhe das
votações que ainda estão sem proposição vinculada e grava a proposição + ementa,
ligando à votação. Sem isso, não dá para saber "sobre o que" cada voto foi — o
que é essencial tanto para curar políticas quanto para o site.

Idempotente, throttled, resiliente (pula votação com erro).

Uso:
  export DATABASE_URL="postgresql://..."
  python ingest/enrich_propositions.py           # só as nominais (recomendado)
  python ingest/enrich_propositions.py --all      # todas as votações da Câmara
"""

import os
import sys
import time

import requests

API = "https://dadosabertos.camara.leg.br/api/v2"

# tipos "substantivos" preferidos como assunto (evita pegar emenda/parecer avulso)
PREF = ["MPV", "PLP", "PEC", "PL", "PLV", "PDL", "PDC", "PLN", "MSC", "PDS"]

session = requests.Session()
session.headers.update({"Accept": "application/json",
                        "User-Agent": "ElesVotamPorVoce/0.1 (enrich)"})


def get_json(url, retries=6):
    for a in range(retries):
        try:
            r = session.get(url, timeout=90)
            if r.status_code == 404:
                return None
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(3 * (a + 1))
                continue
            r.raise_for_status()
            time.sleep(0.25)
            return r.json()
        except (requests.RequestException, ValueError):
            if a == retries - 1:
                raise
            time.sleep(3 * (a + 1))
    return None


def pick_proposition(detalhe):
    """Escolhe a proposição-assunto a partir do detalhe da votação."""
    afetadas = detalhe.get("proposicoesAfetadas") or []
    if not afetadas:
        # fallback: proposição citada na última apresentação
        ult = detalhe.get("ultimaApresentacaoProposicao") or {}
        uri = ult.get("uriProposicaoCitada")
        if uri:
            return {"id": uri.rstrip("/").split("/")[-1], "siglaTipo": None,
                    "numero": None, "ano": None,
                    "ementa": ult.get("descricao")}
        return None

    def rank(p):
        t = p.get("siglaTipo")
        return PREF.index(t) if t in PREF else len(PREF)

    return sorted(afetadas, key=rank)[0]


def main():
    only_nominal = "--all" not in sys.argv
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        sys.exit("ERRO: defina DATABASE_URL.")
    import psycopg2
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute(
        "SELECT id, external_id FROM division "
        "WHERE house='camara' AND proposition_id IS NULL "
        + ("AND is_nominal " if only_nominal else "")
        + "ORDER BY occurred_at"
    )
    rows = cur.fetchall()
    print(f"{len(rows)} votação(ões) da Câmara sem assunto"
          f"{' (nominais)' if only_nominal else ''} — buscando detalhe...")

    done = skipped = 0
    for div_id, ext in rows:
        try:
            payload = get_json(f"{API}/votacoes/{ext}")
            prop = pick_proposition((payload or {}).get("dados", {})) if payload else None
            if not prop or not prop.get("id"):
                skipped += 1
                continue
            cur.execute(
                """INSERT INTO proposition (house, external_id, sigla, numero, ano, ementa)
                   VALUES ('camara', %s, %s, %s, %s, %s)
                   ON CONFLICT (house, external_id) DO UPDATE
                     SET sigla = COALESCE(EXCLUDED.sigla, proposition.sigla),
                         numero = COALESCE(EXCLUDED.numero, proposition.numero),
                         ano = COALESCE(EXCLUDED.ano, proposition.ano),
                         ementa = COALESCE(EXCLUDED.ementa, proposition.ementa)
                   RETURNING id""",
                (str(prop["id"]), prop.get("siglaTipo"),
                 str(prop["numero"]) if prop.get("numero") is not None else None,
                 str(prop["ano"]) if prop.get("ano") is not None else None,
                 prop.get("ementa")),
            )
            pid = cur.fetchone()[0]
            cur.execute("UPDATE division SET proposition_id = %s WHERE id = %s",
                        (pid, div_id))
            conn.commit()
            done += 1
        except Exception as e:            # noqa: BLE001 — resiliência de lote
            conn.rollback()
            skipped += 1
            print(f"[skip {ext}] {e}", file=sys.stderr)

    conn.close()
    print(f"\nConcluído: {done} votação(ões) com assunto preenchido; "
          f"{skipped} sem proposição afetada/erro.")


if __name__ == "__main__":
    main()
