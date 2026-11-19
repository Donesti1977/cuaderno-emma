export function ProgressBar({
  value,
  label,
  tone = "subject",
  size = "md",
}: {
  value: number;
  label: string;
  tone?: "subject" | "ink" | "success";
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`progress progress--${size} progress--${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <span className="progress__fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
