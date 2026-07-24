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
  const dispPos = Math.max(3, Math.min(97, pos));
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
                "linear-gradient(to right,#fecaca 0%,#fde68a 50%,#bbf7d0 100%)",
            }}
          >
            <span
              className="absolute left-0 top-0 h-full w-[3%] rounded-l-full"
              style={{ background: "#dc2626" }}
            />
            <span
              className="absolute right-0 top-0 h-full w-[3%] rounded-r-full"
              style={{ background: "#16a34a" }}
            />
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
