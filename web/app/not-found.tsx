import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-800">Página não encontrada</h1>
      <p className="mt-2 text-slate-500">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-white hover:bg-brand-dark"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
