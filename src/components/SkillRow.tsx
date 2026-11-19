import type { Skill } from "../data/types";
import { masteryLabel } from "../lib/srs";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

export function SkillRow({
  skill,
  mastery,
  compact = false,
}: {
  skill: Skill;
  mastery: number;
  compact?: boolean;
}) {
  return (
    <div className={`skill-row ${compact ? "skill-row--compact" : ""}`}>
      <div className="skill-row__head">
        <span className="skill-row__name">
          {mastery >= 80 ? <Icon name="circle-check" size={17} /> : null}
          {skill.short}
        </span>
        <span className="skill-row__value">
          {mastery > 0 ? `${mastery}%` : "—"}
        </span>
      </div>
      <ProgressBar
        value={mastery}
        label={`Dominio de ${skill.short}`}
        size="sm"
        tone={mastery >= 80 ? "success" : "subject"}
      />
      {!compact ? (
        <p className="skill-row__hint">
          {mastery > 0 ? masteryLabel(mastery) : skill.description}
        </p>
      ) : null}
    </div>
  );
}
