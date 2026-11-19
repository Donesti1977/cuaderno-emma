import { Icon } from "./Icon";

export function StatCard({
  icon,
  value,
  label,
  tone = "ink",
}: {
  icon: string;
  value: string;
  label: string;
  tone?: "ink" | "coral" | "leaf" | "sky" | "marigold";
}) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon">
        <Icon name={icon} size={19} />
      </span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
