import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ScoreBadge from "@/components/ScoreBadge";
import { HOUSE_LABEL, VOTE_LABEL, fmtDate, pct } from "@/lib/format";
import type { PersonDir, PersonStats, ScoreNamed, PersonVote } from "@/lib/types";

export const revalidate = 3600;

async function getPerson(id: number) {
  const [{ data: dir }, { data: stats }, { data: scores }, { data: votes }] =
    await Promise.all([
      supabase.from("person_directory").select("*").eq("id", id).maybeSingle(),
      supabase.from("person_stats").select("*").eq("person_id", id).maybeSingle(),
      supabase
        .from("score_named")
        .select("*")
        .eq("person_id", id)
        .order("score", { ascending: false }),
      supabase
        .from("person_vote")
        .select("*")
        .eq("person_id", id)
        .order("occurred_at", { ascending: false })
        .limit(20),
    ]);
  return {
    dir: dir as PersonDir | null,
    stats: stats as PersonStats | null,
    scores: (scores ?? []) as ScoreNamed[],
    votes: (votes ?? []) as PersonVote[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase
    .from("person_directory")
    .select("name, party_sigla")
    .eq("id", Number(id))
    .maybeSingle();
  return { title: data?.name ?? "Parlamentar" };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();
  const { dir, stats, scores, votes } = await getPerson(id);
  if (!dir) notFound();

  return (
    <div className="space-y-8">
      <Link href="/pessoas" className="text-sm text-brand hover:underline">
        ← Todos os parlamentares
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-slate-100">
          {dir.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dir.photo_url} alt={dir.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">
              {dir.name?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{dir.name}</h1>
          <p className="text-slate-500">
            {dir.party_sigla ?? "sem partido"}
            {dir.uf ? ` · ${dir.uf}` : ""} · {HOUSE_LABEL[dir.house]}
          </p>
          {stats && (
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <span>
                <strong className="text-slate-800">
                  {stats.n_votes.toLocaleString("pt-BR")}
                </strong>{" "}
                votações
              </span>
              <span>
                Presença:{" "}
                <strong className="text-slate-800">
                  {pct(stats.n_attended, stats.n_votes)}
                </strong>
              </span>
              <span>
                {stats.n_sim.toLocaleString("pt-BR")} sim ·{" "}
                {stats.n_nao.toLocaleString("pt-BR")} não
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Concordância por tema */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Posição por tema
        </h2>
        {scores.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ainda não há temas com votos suficientes para este parlamentar.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {scores.map((s) => (
              <Link
                key={s.policy_id}
                href={`/politicas/${s.policy_id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{s.policy_name}</span>
                <ScoreBadge
                  score={s.category === "not_enough" ? null : s.score}
                  category={s.category}
                  small
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Votos recentes */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Votos recentes
        </h2>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {votes.map((v) => (
            <Link
              key={v.division_id}
              href={`/votacoes/${v.division_id}`}
              className="flex items-start justify-between gap-4 p-4 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-700">
                  {v.description ?? `Votação #${v.division_id}`}
                </p>
                <p className="text-xs text-slate-400">
                  {fmtDate(v.occurred_at)} · {HOUSE_LABEL[v.house]}
                </p>
              </div>
              <VoteChip option={v.option} />
            </Link>
          ))}
          {votes.length === 0 && (
            <p className="p-4 text-sm text-slate-500">Sem votos registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function VoteChip({ option }: { option: string }) {
  const map: Record<string, string> = {
    sim: "bg-green-100 text-green-800",
    nao: "bg-red-100 text-red-800",
  };
  const cls = map[option] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {VOTE_LABEL[option] ?? option}
    </span>
  );
}
