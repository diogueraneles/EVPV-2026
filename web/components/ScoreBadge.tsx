import { scoreColor, categoryLabel } from "@/lib/format";

export default function ScoreBadge({
  score,
  category,
  small,
}: {
  score: number | null;
  category: string;
  small?: boolean;
}) {
  const color = scoreColor(score);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium text-white ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ backgroundColor: color }}
      title={category ? categoryLabel(category) : undefined}
    >
      {categoryLabel(category)}
      {score !== null && (
        <span className="opacity-90">{Math.round(score)}%</span>
      )}
    </span>
  );
}
