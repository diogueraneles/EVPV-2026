import Link from "next/link";

const links = [
  { href: "/pessoas", label: "Parlamentares" },
  { href: "/politicas", label: "Temas" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/sobre", label: "Sobre" },
];

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold leading-tight text-brand"
        >
          <span className="text-lg">Eles Votam por Você</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-slate-600 hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
