#!/usr/bin/env python3
"""
Enriquecimento de ASSUNTO — Câmara dos Deputados (concorrente)
Projeto: Eles Votam Por Você

A lista/arquivos em massa NÃO trazem o assunto real das votações de Plenário; o
detalhe /votacoes/{id} traz `proposicoesAfetadas` (o projeto/MP de fato, com
ementa). Este script busca esse detalhe para as votações sem assunto e grava a
proposição + ementa, ligando à votação.

Para não estourar o tempo, faz as requisições EM PARALELO (várias ao mesmo
tempo) e grava no banco em lotes. É idempotente e RESUMÍVEL: só processa as
votações onde `proposition_id IS NULL`, então rodar de novo continua de onde
parou.

Uso:
  export DATABASE_URL="postgresql://..."
  python ingest/enrich_propositions.py            # nominais sem assunto
  python ingest/enrich_propositions.py --all       # todas as da Câmara
"""

import concurrent.futures
import os
import sys
import time

import requests

API = "https://dadosabertos.camara.leg.br/api/v2"
PREF = ["MPV", "PLP", "PEC", "PL", "PLV", "PDL", "PDC", "PLN", "MSC", "PDS"]
WORKERS = 8
BATCH = 120


def get_json(url, retries=5):
    for a in range(retries):
        try:
            r = requests.get(url, headers={"Accept": "application/json",
                                           "User-Agent": "ElesVotamPorVoce/0.1 (enrich)"},
                             timeout=45)
            if r.status_code == 404:
                return None
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(2 * (a + 1))
                continue
            r.raise_for_status()
            return r.json()
        except (requests.RequestException, ValueError):
            if a == retries - 1:
                return None          # não derruba o lote: apenas pula
            time.sleep(2 * (a + 1))
    return None


def pick_proposition(detalhe):
    afetadas = detalhe.get("proposicoesAfetadas") or []
    if not afetadas:
        ult = detalhe.get("ultimaApresentacaoProposicao") or {}
        uri = ult.get("uriProposicaoCitada") or ult.get("uriProposicao")
        if uri:
            return {"id": uri.rstrip("/").split("/")[-1], "siglaTipo": None,
                    "numero": None, "ano": None, "ementa": ult.get("descricao")}
        return None

    def rank(p):
        t = p.get("siglaTipo")
        return PREF.index(t) if t in PREF else len(PREF)
    return sorted(afetadas, key=rank)[0]


def fetch_one(ext):
    """Busca o detalhe de uma votação e devolve (ext, proposição|None)."""
    payload = get_json(f"{API}/votacoes/{ext}")
    prop = pick_proposition((payload or {}).get("dados", {})) if payload else None
    return ext, prop


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
    div_by_ext = {ext: div_id for div_id, ext in rows}
    exts = list(div_by_ext)
    print(f"{len(exts)} votações sem assunto"
          f"{' (nominais)' if only_nominal else ''} — buscando em paralelo "
          f"({WORKERS} de cada vez)...", flush=True)

    done = skipped = seen = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for i in range(0, len(exts), BATCH):
            chunk = exts[i:i + BATCH]
            for ext, prop in pool.map(fetch_one, chunk):
                seen += 1
                if not prop or not prop.get("id"):
                    skipped += 1
                    continue
                try:
                    cur.execute(
                        """INSERT INTO proposition (house, external_id, sigla, numero, ano, ementa)
                           VALUES ('camara', %s, %s, %s, %s, %s)
                           ON CONFLICT (house, external_id) DO UPDATE
                             SET sigla=COALESCE(EXCLUDED.sigla, proposition.sigla),
                                 numero=COALESCE(EXCLUDED.numero, proposition.numero),
                                 ano=COALESCE(EXCLUDED.ano, proposition.ano),
                                 ementa=COALESCE(EXCLUDED.ementa, proposition.ementa)
                           RETURNING id""",
                        (str(prop["id"]), prop.get("siglaTipo"),
                         str(prop["numero"]) if prop.get("numero") is not None else None,
                         str(prop["ano"]) if prop.get("ano") is not None else None,
                         prop.get("ementa")))
                    pid = cur.fetchone()[0]
                    cur.execute("UPDATE division SET proposition_id=%s WHERE id=%s",
                                (pid, div_by_ext[ext]))
                    done += 1
                except Exception as e:        # noqa: BLE001
                    conn.rollback()
                    skipped += 1
                    print(f"[skip {ext}] {e}", file=sys.stderr)
                    continue
            conn.commit()
            print(f"  {seen}/{len(exts)} processadas ({done} com assunto)...", flush=True)

    conn.close()
    print(f"\nConcluído: {done} votação(ões) com assunto; {skipped} sem/erro.", flush=True)


if __name__ == "__main__":
    main()
