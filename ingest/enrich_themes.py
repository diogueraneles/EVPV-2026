#!/usr/bin/env python3
"""
Enriquecimento de TEMAS — Câmara dos Deputados (concorrente)
Projeto: Eles Votam Por Você

A Câmara classifica cada proposição em temas OFICIAIS (ex.: "Meio Ambiente e
Desenvolvimento Sustentável", "Trabalho e Emprego") via /proposicoes/{id}/temas.
Isso permite achar as votações de um assunto com precisão — sem depender de
palavra-chave na ementa, que gera falso-positivo e deixa votação de fora.

Faz as requisições EM PARALELO e grava em LOTE. É idempotente e RESUMÍVEL: por
padrão só busca proposições que ainda não têm tema, então rodar de novo continua
de onde parou.

Uso:
  export DATABASE_URL="postgresql://..."
  python ingest/enrich_themes.py           # so as que faltam
  python ingest/enrich_themes.py --all     # revisita todas (atualiza)
"""

import concurrent.futures
import os
import sys
import time

import requests

API = "https://dadosabertos.camara.leg.br/api/v2"
WORKERS = 8


def get_json(url, retries=5):
    for a in range(retries):
        try:
            r = requests.get(url, headers={"Accept": "application/json",
                                           "User-Agent": "ElesVotamPorVoce/0.1 (themes)"},
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
                return None          # nao derruba o lote: apenas pula
            time.sleep(2 * (a + 1))
    return None


def fetch_one(row):
    """row = (proposition_id, external_id) -> (proposition_id, [temas])"""
    pid, ext = row
    payload = get_json(f"{API}/proposicoes/{ext}/temas")
    temas = (payload or {}).get("dados") or []
    return pid, temas


def main():
    revisit_all = "--all" in sys.argv
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        sys.exit("ERRO: defina DATABASE_URL.")
    import psycopg2
    from psycopg2.extras import execute_values

    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()

    # so proposicoes da Camara que TEM votacao nominal (o resto nao interessa)
    cur.execute(
        """SELECT DISTINCT pr.id, pr.external_id
           FROM proposition pr
           JOIN division d ON d.proposition_id = pr.id AND d.is_nominal
           WHERE pr.house = 'camara' AND pr.external_id IS NOT NULL
             {}
           ORDER BY pr.id""".format(
            "" if revisit_all
            else "AND NOT EXISTS (SELECT 1 FROM proposition_theme pt WHERE pt.proposition_id = pr.id)"
        )
    )
    rows = cur.fetchall()
    total = len(rows)
    print(f"{total} proposicao(oes) para buscar tema"
          f"{' (todas)' if revisit_all else ' (faltantes)'} — "
          f"{WORKERS} em paralelo...", flush=True)

    # codigos de tema validos (a tabela theme ja vem carregada com os 32 oficiais)
    cur.execute("SELECT cod FROM theme")
    valid = {c for (c,) in cur.fetchall()}

    seen = com_tema = sem_tema = desconhecido = 0
    buf = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for pid, temas in pool.map(fetch_one, rows):
            seen += 1
            if temas:
                com_tema += 1
                for t in temas:
                    cod = t.get("codTema")
                    if cod in valid:
                        buf.append((pid, cod, t.get("relevancia")))
                    else:
                        desconhecido += 1
                        print(f"[tema fora do vocabulario] cod={cod} "
                              f"nome={t.get('tema')!r}", file=sys.stderr)
            else:
                sem_tema += 1

            if len(buf) >= 200:
                execute_values(cur,
                    "INSERT INTO proposition_theme (proposition_id, theme_cod, relevancia) "
                    "VALUES %s ON CONFLICT (proposition_id, theme_cod) DO UPDATE "
                    "SET relevancia = EXCLUDED.relevancia", buf)
                conn.commit()
                buf = []
            if seen % 25 == 0:
                print(f"  {seen}/{total} ({com_tema} com tema)...", flush=True)

    if buf:
        execute_values(cur,
            "INSERT INTO proposition_theme (proposition_id, theme_cod, relevancia) "
            "VALUES %s ON CONFLICT (proposition_id, theme_cod) DO UPDATE "
            "SET relevancia = EXCLUDED.relevancia", buf)
    conn.commit()

    cur.execute("SELECT count(*) FROM proposition_theme")
    gravados = cur.fetchone()[0]
    conn.close()
    print(f"\nConcluido: {com_tema} proposicao(oes) com tema, {sem_tema} sem tema, "
          f"{desconhecido} tema(s) fora do vocabulario.", flush=True)
    print(f"Total de vinculos proposicao-tema no banco: {gravados}", flush=True)


if __name__ == "__main__":
    main()
