import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { SkillRow } from "../components/SkillRow";
import { useActiveGrade, useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { findSubjectOfUnit, findUnit } from "../data/lookup";
import { isDue } from "../lib/srs";
import { estimatedMinutes, sessionSize } from "../lib/session";

export function UnitPage() {
  const { subjectId, unitId } = useParams();
  const profile = useProfileContext();
  const grade = useActiveGrade();
  const stats = useLearningStats(profile.id, grade);
  const unit = findUnit(unitId, grade);
  const subject = unit ? findSubjectOfUnit(unit) : undefined;

  if (!unit || !subject) {
    return (
      <div className="page">
        <PageHeader
          title="Esta unidad no existe"
          description="Puede que el enlace esté mal o que la unidad aún no esté publicada."
          back={{ to: "/materias", label: "Volver a materias" }}
        />
      </div>
    );
  }

  const progressBySkill = new Map(
    stats.progress.map((item) => [item.skillId, item]),
  );
  const mastery = stats.unitMastery[unit.id] ?? 0;
  const ready = unit.status === "ready";
  const size = sessionSize(profile.settings.dailyGoal);
  const minutes = estimatedMinutes(Math.min(size, unit.activities.length));
  const dueSkills = unit.skills.filter((skill) => {
    const progress = progressBySkill.get(skill.id);
    return progress ? isDue(progress) : false;
  });
  const dominated = mastery >= 80;

  const style = {
    "--subject": subject.color,
    "--subject-soft": subject.soft,
  } as CSSProperties;

  return (
    <div className="page page--unit" style={style}>
      <PageHeader
        back={{
          to: `/materias/${subject.id}`,
          label: subject.shortName,
        }}
        eyebrow={`${unit.term} · ${unit.subtitle}`}
        title={unit.title}
        description={unit.description}
      />

      <section className="unit-hero">
        <div className="unit-hero__main">
          <div className="unit-hero__badges">
            <span className={`chip ${dominated ? "chip--success" : "chip--soft"}`}>
              {dominated ? (
                <>
                  <Icon name="circle-check" size={15} /> Unidad dominada
                </>
              ) : mastery > 0 ? (
                "En práctica"
              ) : (
                "Para empezar"
              )}
            </span>
            {dueSkills.length > 0 ? (
              <span className="chip chip--warm">
                {dueSkills.length} {dueSkills.length === 1 ? "repaso" : "repasos"} pendientes
              </span>
            ) : null}
          </div>
          <div className="unit-hero__progress">
            <div className="unit-hero__progress-head">
              <span>Dominio de la unidad</span>
              <strong>{mastery}%</strong>
            </div>
            <ProgressBar value={mastery} label="Dominio de la unidad" />
          </div>
          <div className="unit-hero__actions">
            {ready ? (
              <Link className="btn btn--primary btn--big" to={`/sesion/${unit.id}`}>
                {mastery === 0
                  ? "Empezar la unidad"
                  : dominated
                    ? "Repasar un poco"
                    : "Seguir practicando"}
                <Icon name="play" size={17} />
              </Link>
            ) : (
              <span className="btn btn--disabled">
                <Icon name="lock" size={17} /> En preparación
              </span>
            )}
            {ready ? (
              <span className="unit-hero__meta">
                {size} preguntas · {minutes} min
              </span>
            ) : null}
          </div>
        </div>
        <div className="unit-hero__side">
          <span className="unit-hero__side-icon">
            <Icon name={subject.icon} size={28} />
          </span>
          <p>
            {ready
              ? "La sesión mezcla lo que toca repasar con lo que estás aprendiendo. Si algo falla, vuelve con una explicación."
              : "Estamos preparando las actividades de esta unidad. Mientras tanto, puedes repasar la unidad que ya está lista."}
          </p>
        </div>
      </section>

      {ready ? (
        <section className="section">
          <div className="section__head">
            <h2>Qué vas a practicar</h2>
            <span className="chip chip--soft">{unit.skills.length} habilidades</span>
          </div>
          <div className="skill-list">
            {unit.skills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                mastery={progressBySkill.get(skill.id)?.mastery ?? 0}
              />
            ))}
          </div>
          <p className="footnote">
            Cada respuesta ajusta tu dominio. No hay nota: solo una brújula para
            saber qué conviene repasar.
          </p>
        </section>
      ) : null}

      {ready ? (
        <section className="how-card">
          <span className="how-card__num">1</span>
          <div>
            <h2>Calentamos</h2>
            <p>Una pregunta fácil para entrar en materia y quitarte los nervios.</p>
          </div>
          <span className="how-card__num">2</span>
          <div>
            <h2>Practicamos</h2>
            <p>Seis u ocho preguntas mezcladas. Si fallas, te explico el porqué.</p>
          </div>
          <span className="how-card__num">3</span>
          <div>
            <h2>Cerramos</h2>
            <p>Un resumen corto y una pegatina si toca. Nunca se pierde nada.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
