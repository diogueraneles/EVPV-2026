import Link from "next/link";

const links = [
  { href: "/pessoas", label: "Parlamentares" },
  { href: "/politicas", label: "Políticas" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/faq", label: "FAQ" },
  { href: "/sobre", label: "Sobre" },
];

export default function Navbar() {
  return (
    <header className="site-nav bg-brand">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="nav-brand flex items-center gap-2 font-semibold leading-tight text-white"
        >
          <span className="text-lg">Eles Votam por Você</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-lg font-semibold">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link text-white/80 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
