"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/pessoas?q=${encodeURIComponent(q)}`);
      }}
      className="mx-auto flex w-full max-w-xl gap-2"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Digite o nome do seu deputado ou senador…"
        className="w-full rounded-lg border border-white/30 bg-white/95 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="rounded-lg bg-white px-5 py-3 font-semibold text-brand hover:bg-white/90"
      >
        Buscar
      </button>
    </form>
  );
}
