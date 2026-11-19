import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { findSubject } from "../data/lookup";
import type { Unit } from "../data/types";
import { estimatedMinutes } from "../lib/session";

function UnitCard({
  unit,
  mastery,
}: {
  unit: Unit;
  mastery: number;
}) {
  const ready = unit.status === "ready";
  const activityCount = unit.activities.length;
  const content = (
    <>
      <span className="unit-card__order">{String(unit.order).padStart(2, "0")}</span>
      <div className="unit-card__copy">
        <p className="unit-card__term">{unit.term}</p>
        <h3>{unit.title}</h3>
        <p className="unit-card__sub">{unit.subtitle}</p>
        <p className="unit-card__desc">{unit.description}</p>
        <div className="unit-card__meta">
          {ready ? (
            <>
              <span>
                <Icon name="book" size={15} /> {unit.skills.length} habilidades
              </span>
              <span>
                <Icon name="clock" size={15} />{" "}
                {estimatedMinutes(Math.min(activityCount, 8))} min
              </span>
              <span>
                <Icon name="target" size={15} /> {activityCount} preguntas
              </span>
            </>
          ) : (
            <span>
              <Icon name="lock" size={15} /> En preparación
            </span>
          )}
        </div>
      </div>
      <div className="unit-card__side">
        {ready ? (
          <>
            <span className="unit-card__pct">{mastery}%</span>
            <ProgressBar
              value={mastery}
              label={`Dominio de ${unit.title}`}
              size="sm"
            />
            <span className="link-arrow">
              Abrir <Icon name="arrow-right" size={16} />
            </span>
          </>
        ) : (
          <span className="chip chip--soft">Pronto</span>
        )}
      </div>
    </>
  );

  if (!ready) {
    return (
      <article className="unit-card unit-card--soon" aria-disabled="true">
        {content}
      </article>
    );
  }

  return (
    <Link className="unit-card" to={`/materias/${unit.subjectId}/${unit.id}`}>
      {content}
    </Link>
  );
}

export function SubjectPage() {
  const { subjectId } = useParams();
  const profile = useProfileContext();
  const stats = useLearningStats(profile.id);
  const subject = findSubject(subjectId);

  if (!subject) {
    return (
      <div className="page">
        <PageHeader
          title="Esta materia no existe"
          description="Puede que el enlace esté mal o que la materia haya cambiado de nombre."
          back={{ to: "/materias", label: "Volver a materias" }}
        />
      </div>
    );
  }

  const style = {
    "--subject": subject.color,
    "--subject-soft": subject.soft,
  } as CSSProperties;

  return (
    <div className="page page--subject" style={style}>
      <PageHeader
        back={{ to: "/materias", label: "Todas las materias" }}
        eyebrow={subject.status === "ready" ? "Lista para practicar" : "En preparación"}
        title={subject.name}
        description={subject.description}
        actions={
          <span className="subject-hero__badge">
            <Icon name={subject.icon} size={22} />
            {subject.status === "ready"
              ? (() => {
                  const ready = subject.units.filter(
                    (unit) => unit.status === "ready",
                  ).length;
                  return `${ready} ${ready === 1 ? "unidad lista" : "unidades listas"}`;
                })()
              : "Muy pronto"}
          </span>
        }
      />

      {subject.status === "soon" ? (
        <div className="notice notice--soft">
          <Icon name="spark" size={18} />
          <p>
            Las actividades de {subject.shortName} todavía se están preparando.
            Aquí tienes el mapa de lo que vendrá, sacado de la programación de
            este curso.
          </p>
        </div>
      ) : null}

      <section className="section">
        <div className="section__head">
          <h2>Unidades</h2>
          <span className="chip chip--soft">
            {subject.units.length} {subject.units.length === 1 ? "unidad" : "unidades"}
          </span>
        </div>
        <div className="unit-list">
          {subject.units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              mastery={stats.unitMastery[unit.id] ?? 0}
            />
          ))}
        </div>
      </section>

      {subject.tools && subject.tools.length > 0 ? (
        <section className="section">
          <div className="section__head">
            <h2>Herramientas</h2>
          </div>
          <div className="tool-list">
            {subject.tools.map((tool) => (
              <a
                key={tool.id}
                className="tool-card"
                href={`${import.meta.env.BASE_URL}${tool.href}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="tool-card__icon">
                  <Icon name="print" size={22} />
                </span>
                <span className="tool-card__copy">
                  <span className="tool-card__name">
                    {tool.name}
                    {tool.badge ? <span className="chip chip--soft">{tool.badge}</span> : null}
                  </span>
                  <span className="tool-card__desc">{tool.description}</span>
                </span>
                <Icon name="arrow-right" size={18} />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <p className="footnote">
        Cada unidad se practica en sesiones cortas. No hay que terminarla del
        tirón: el repaso vuelve solo cuando toca.
      </p>
    </div>
  );
}
