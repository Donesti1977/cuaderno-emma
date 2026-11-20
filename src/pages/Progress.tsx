import { Link } from "react-router-dom";
import { Capybara } from "../components/Capybara";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { SkillRow } from "../components/SkillRow";
import { StatCard } from "../components/StatCard";
import { useActiveGrade, useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { findSkill, findUnitOfSkill, studyableSubjects } from "../data/lookup";
import { formatMinutes } from "../lib/dates";
import { evaluateStickers } from "../lib/rewards";
import { masteryLabel } from "../lib/srs";

export function Progress() {
  const profile = useProfileContext();
  const grade = useActiveGrade();
  const stats = useLearningStats(profile.id, grade);
  const stickers = evaluateStickers(stats);
  const unlocked = stickers.filter((sticker) => sticker.unlocked).length;
  const progressBySkill = new Map(
    stats.progress.map((item) => [item.skillId, item]),
  );
  const maxWeek = Math.max(1, ...stats.week.map((day) => day.minutes));
  const readySubjects = studyableSubjects(grade).filter((subject) =>
    subject.units.some((unit) => unit.status === "ready"),
  );
  const weak = stats.weakSkills
    .map((item) => ({
      item,
      skill: findSkill(item.skillId, grade),
      unit: findUnitOfSkill(item.skillId, grade),
    }))
    .filter((entry) => entry.skill && entry.unit)
    .slice(0, 4);

  if (stats.totalAttempts === 0) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Tu recorrido"
          title="Progreso"
          description="Aquí se verá lo que vas aprendiendo. Todavía está en blanco, que también tiene su encanto."
        />
        <div className="empty-state empty-state--large">
          <Capybara size={220} />
          <h2>La primera huella está por llegar</h2>
          <p>
            Cuando termines una sesión, aquí aparecerán tus habilidades, tu
            racha y las pegatinas que vayas consiguiendo.
          </p>
          <Link className="btn btn--primary" to="/">
            Ir a la misión de hoy <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tu recorrido"
        title="Progreso"
        description="No es una nota. Es un mapa para saber qué conviene repasar y qué ya dominas."
        actions={
          <span className="chip chip--soft">
            <Icon name="star" size={15} /> {unlocked}{" "}
            {unlocked === 1 ? "pegatina" : "pegatinas"}
          </span>
        }
      />

      <div className="stats-row stats-row--wide">
        <StatCard
          icon="flame"
          value={`${stats.streak}`}
          label={stats.streak === 1 ? "día seguido" : "días seguidos"}
          tone="coral"
        />
        <StatCard
          icon="clock"
          value={formatMinutes(stats.totalMinutes)}
          label="de estudio"
          tone="marigold"
        />
        <StatCard
          icon="target"
          value={`${stats.accuracy}%`}
          label="aciertos"
          tone="sky"
        />
        <StatCard
          icon="circle-check"
          value={`${stats.masteredSkills}`}
          label="habilidades dominadas"
          tone="leaf"
        />
      </div>

      <div className="progress-grid">
        <section className="week-card">
          <div className="section__head">
            <h2>Últimos siete días</h2>
            <span className="chip chip--soft">
              {formatMinutes(stats.week.reduce((sum, day) => sum + day.minutes, 0))}
            </span>
          </div>
          <div className="week-chart" role="list" aria-label="Minutos de estudio por día">
            {stats.week.map((day) => {
              const height =
                day.minutes === 0
                  ? 0
                  : Math.max(14, Math.round((day.minutes / maxWeek) * 100));
              const today = day.key === stats.week[stats.week.length - 1]?.key;
              return (
                <div
                  key={day.key}
                  className={`week-bar ${today ? "week-bar--today" : ""}`}
                  role="listitem"
                  aria-label={`${day.label}: ${formatMinutes(day.minutes)}`}
                >
                  <span className="week-bar__value">
                    {day.minutes > 0 ? day.minutes : ""}
                  </span>
                  <span className="week-bar__track">
                    {day.minutes > 0 ? (
                      <span className="week-bar__fill" style={{ height: `${height}%` }} />
                    ) : null}
                  </span>
                  <span className="week-bar__label">{day.label}</span>
                </div>
              );
            })}
          </div>
          <p className="week-card__foot">
            {stats.week.filter((day) => day.sessions > 0).length}{" "}
            {stats.week.filter((day) => day.sessions > 0).length === 1
              ? "día con sesión"
              : "días con sesión"}{" "}
            · sin comparar con nadie
          </p>
        </section>

        <section className="focus-card">
          <div className="section__head">
            <h2>Para repasar</h2>
            <span className="chip chip--warm">{stats.dueSkills.length}</span>
          </div>
          {weak.length > 0 ? (
            <ul className="focus-list">
              {weak.map(({ item, skill, unit }) => (
                <li key={item.skillId}>
                  <span className="focus-list__dot" aria-hidden="true" />
                  <span className="focus-list__copy">
                    <strong>{skill?.short}</strong>
                    <span>
                      {item.mastery}% · {masteryLabel(item.mastery)}
                    </span>
                  </span>
                  {unit ? (
                    <Link
                      className="icon-btn"
                      to={`/sesion/${unit.id}`}
                      aria-label={`Practicar ${skill?.short}`}
                    >
                      <Icon name="play" size={17} />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="focus-card__empty">
              Nada urgente. Sigue con la unidad que tienes entre manos.
            </p>
          )}
          <p className="focus-card__note">
            El repaso vuelve solo cuando toca. No hay que perseguirlo.
          </p>
        </section>
      </div>

      <section className="section">
        <div className="section__head">
          <h2>Mapa de habilidades</h2>
          <span className="chip chip--soft">{grade}º de Primaria</span>
        </div>
        <div className="skill-map">
          {readySubjects.map((subject) => (
            <div key={subject.id} className="skill-map__subject">
              <div className="skill-map__head">
                <span
                  className="skill-map__icon"
                  style={{ background: subject.soft, color: subject.color }}
                >
                  <Icon name={subject.icon} size={18} />
                </span>
                <h3>{subject.shortName}</h3>
              </div>
              {subject.units
                .filter((unit) => unit.status === "ready")
                .map((unit) => (
                  <div key={unit.id} className="skill-map__unit">
                    <p>{unit.title}</p>
                    {unit.skills.map((skill) => (
                      <SkillRow
                        key={skill.id}
                        skill={skill}
                        mastery={progressBySkill.get(skill.id)?.mastery ?? 0}
                        compact
                      />
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <p className="footnote">
        Todo se guarda en este dispositivo. Puedes hacer una copia desde el
        panel de padres.
      </p>
    </div>
  );
}
