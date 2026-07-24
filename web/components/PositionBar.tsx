import { categoryLabel, scoreColor, supportTip } from "@/lib/format";

const TICKS = [10, 20, 30, 40, 60, 70, 80, 90];

export default function PositionBar({
  score,
  category,
  showLabel = true,
}: {
  score: number | null;
  category: string;
  showLabel?: boolean;
}) {
  const enough = category !== "not_enough" && score !== null;
  const pos = enough ? Math.max(0, Math.min(100, score as number)) : 50;
  const dispPos = pos <= 3 ? 1.5 : pos >= 97 ? 98.5 : pos;
  const color = enough ? scoreColor(score) : "#94a3b8";
  return (
    <div className="group relative w-full">
      {showLabel && (
        <p
          className="mb-1 text-center text-base font-medium leading-tight"
          style={{ color }}
        >
          {categoryLabel(category)}
        </p>
      )}
      {enough ? (
        <>
          <div
            className="relative mt-[18px] h-[11px] rounded-full"
            style={{
              background:
                "linear-gradient(to right,#dc2626 0%,#f87171 8%,#fecaca 22%,#fde68a 50%,#bbf7d0 78%,#34d399 92%,#16a34a 100%)",
            }}
          >
            {TICKS.map((t) => (
              <span
                key={t}
                className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-black/10"
                style={{ left: `${t}%` }}
              />
            ))}
            <span className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-y-1/2 bg-black/20" />
            <span
              aria-hidden
              className="animate-marker absolute -top-4 -translate-x-1/2"
              style={{ left: `${dispPos}%` }}
            >
              <span
                className="block h-0 w-0 border-x-[10px] border-t-[12px] border-x-transparent"
                style={{ borderTopColor: color }}
              />
            </span>
            <span
              aria-hidden
              className="animate-marker absolute top-0 h-full w-[2px] -translate-x-1/2"
              style={{ left: `${dispPos}%`, background: color }}
            />
            <span
              className="pointer-events-none absolute -top-11 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `${dispPos}%` }}
            >
              {supportTip(score)}
            </span>
          </div>
          <div className="mt-1.5 flex justify-between text-[13px] font-bold">
            <span className="text-red-700">Contra</span>
            <span className="text-green-700">A favor</span>
          </div>
        </>
      ) : (
        <div className="mt-[18px] h-[11px] rounded-full bg-slate-100" />
      )}
    </div>
  );
}
