export default function LogoMark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 34" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="evpv-lg" x1="0" x2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="0.5" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="2" y="21" width="116" height="8" rx="4" fill="url(#evpv-lg)" />
      <path d="M78 4 L94 4 L86 17 Z" fill="#a78bfa" />
    </svg>
  );
}
