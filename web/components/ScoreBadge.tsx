import { categoryFromScore, categoryLabel, scoreColor, supportTip } from "@/lib/format";

export default function ScoreBadge({
  score,
  category,
  small,
}: {
  score: number | null;
  category: string;
  small?: boolean;
}) {
  const cat = category && category.length > 0 ? category : categoryFromScore(score);
  const color = cat === "not_enough" ? "#94a3b8" : scoreColor(score);
  const tip = cat === "not_enough" ? null : supportTip(score);
  return (
    <span
      className={`group/sb relative inline-flex items-center justify-center rounded-full text-center font-medium text-white ${
        small ? "px-2 py-0.5 text-[13px]" : "px-3 py-1 text-[15px]"
      }`}
      style={{ backgroundColor: color }}
    >
      {categoryLabel(cat)}
      {tip && (
        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs font-normal text-white opacity-0 transition-opacity group-hover/sb:opacity-100">
          {tip}
        </span>
      )}
    </span>
  );
}
