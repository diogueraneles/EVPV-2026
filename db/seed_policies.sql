-- ============================================================================
--  Políticas curadas (trabalho editorial) — versionado para recuperação.
--  Recria as políticas e seus vínculos referenciando as votações por
--  (house, external_id), que são estáveis mesmo se o banco for reconstruído.
--
--  Idempotente: apaga a política de mesmo nome (cascata remove vínculos e
--  scores antigos) e recria. Depois, recalcule os scores (scoring/score.py).
--
--    psql "$DATABASE_URL" -f db/seed_policies.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
--  Política: Direitos e proteção das mulheres
-- ---------------------------------------------------------------------------
DELETE FROM policy WHERE name = 'Direitos e proteção das mulheres';
WITH p AS (
  INSERT INTO policy (name, description, provisional) VALUES (
    'Direitos e proteção das mulheres',
    'Proteção das mulheres contra a violência (Lei Maria da Penha, feminicídio, monitoramento de agressores) e igualdade de direitos (salário, não discriminação de gênero), além da priorização de projetos pró-mulher. Votar SIM apoia a política.',
    false) RETURNING id
)
INSERT INTO policy_division (policy_id, division_id, stance, strength)
SELECT p.id, d.id, v.stance, v.strength
FROM p
JOIN (VALUES
  ('2351179-51','for','strong'),
  ('2421056-8','for','normal'),
  ('2427395-8','for','normal'),
  ('2267839-92','for','normal'),
  ('2574143-8','for','normal'),
  ('2449741-72','for','normal'),
  ('2462009-79','for','strong'),
  ('2626432-8','for','normal'),
  ('2606313-36','for','strong')
) AS v(ext, stance, strength) ON TRUE
JOIN division d ON d.house='camara' AND d.external_id = v.ext;

-- ---------------------------------------------------------------------------
--  Política: Proteção ao meio ambiente
--  (flexibilizações do licenciamento = CONTRA; políticas de clima = A FAVOR)
-- ---------------------------------------------------------------------------
DELETE FROM policy WHERE name = 'Proteção ao meio ambiente';
WITH p AS (
  INSERT INTO policy (name, description, provisional) VALUES (
    'Proteção ao meio ambiente',
    'Rigor na proteção ambiental: CONTRA a flexibilização do licenciamento (PL 2159/2021 "PL da Devastação", MPV 1308/2025, exclusão da silvicultura) e A FAVOR de políticas de clima (mercado de carbono, combustível de baixo carbono). Score alto = defende o meio ambiente.',
    false) RETURNING id
)
INSERT INTO policy_division (policy_id, division_id, stance, strength)
SELECT p.id, d.id, v.stance, v.strength
FROM p
JOIN (VALUES
  ('1548579-144','for','normal'),
  ('2238434-100','for','normal'),
  ('2324721-94','against','normal'),
  ('257161-454','against','strong'),
  ('2541991-38','against','strong')
) AS v(ext, stance, strength) ON TRUE
JOIN division d ON d.house='camara' AND d.external_id = v.ext;

COMMIT;

-- Após rodar: recalcule os scores com  python scoring/score.py
