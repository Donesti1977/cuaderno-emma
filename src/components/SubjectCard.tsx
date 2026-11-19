import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Subject } from "../data/types";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

export function SubjectCard({
  subject,
  mastery,
}: {
  subject: Subject;
  mastery: number;
}) {
  const style = {
    "--subject": subject.color,
    "--subject-soft": subject.soft,
  } as CSSProperties;

  return (
    <Link
      to={`/materias/${subject.id}`}
      className={`subject-card ${subject.status === "soon" ? "subject-card--soon" : ""}`}
      style={style}
    >
      <span className="subject-card__icon">
        <Icon name={subject.icon} size={24} />
      </span>
      <span className="subject-card__name">{subject.name}</span>
      <span className="subject-card__desc">{subject.description}</span>
      <span className="subject-card__foot">
        {subject.status === "ready" ? (
          <>
            <ProgressBar
              value={mastery}
              label={`Progreso de ${subject.shortName}`}
              size="sm"
            />
            <span className="subject-card__pct">{mastery}%</span>
          </>
        ) : (
          <span className="chip chip--soft">En camino</span>
        )}
      </span>
    </Link>
  );
}
