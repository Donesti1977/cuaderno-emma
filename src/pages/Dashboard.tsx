import { Link } from "react-router-dom";
import { Capybara } from "../components/Capybara";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { StatCard } from "../components/StatCard";
import { SubjectCard } from "../components/SubjectCard";
import { useActiveGrade, useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { findSkill, readyUnits, studyableSubjects } from "../data/lookup";
import type { Subject } from "../data/types";
import { formatLongDate, formatMinutes, greeting } from "../lib/dates";
import { evaluateStickers } from "../lib/rewards";
import { estimatedMinutes, sessionSize } from "../lib/session";
import { masteryLabel } from "../lib/srs";

function subjectMastery(subject: Subject, unitMastery: Record<string, number>) {
  const ready = subject.units.filter((unit) => unit.status === "ready");
  if (ready.length === 0) return 0;
  return Math.round(
    ready.reduce((sum, unit) => sum + (unitMastery[unit.id] ?? 0), 0) /
      ready.length,
  );
}

export function Dashboard() {
  const profile = useProfileContext();
  const grade = useActiveGrade();
  const stats = useLearningStats(profile.id, grade);
  const heroUnit = readyUnits(grade)[0] ?? null;
  const stickers = evaluateStickers(stats);
  const unlocked = stickers.filter((sticker) => sticker.unlocked).length;
  const size = sessionSize(profile.settings.dailyGoal);
  const minutes = estimatedMinutes(size);
  const unitMastery = heroUnit ? (stats.unitMastery[heroUnit.id] ?? 0) : 0;
  const studiedToday = stats.todaySessions > 0;
  const dueCount = stats.dueSkills.length;
  const nextSkill =
    findSkill(stats.weakSkills[0]?.skillId, grade) ?? heroUnit?.skills[0];

  return (
    <div className="page page--dashboard">
      {!heroUnit ? (
        <div className="notice">
          <Icon name="spark" size={18} />
          <p>El contenido de {grade}º todavía se está preparando.</p>
        </div>
      ) : null}

      <section className="hero">
        <div className="hero__copy">
          <p className="hero__date">{formatLongDate()}</p>
          <h1>
            {greeting()}, <span>{profile.name}</span>.
          </h1>
          <p className="hero__sub">
            Hoy no hay que hacerlo todo. Solo lo siguiente.
          </p>
          <div className="hero__meta">
            <span className="hero__pill">
              <Icon name="flame" size={16} />
              {stats.streak > 0
                ? `${stats.streak} ${stats.streak === 1 ? "día" : "días"} de racha`
                : "Hoy puede ser el primer día"}
            </span>
            <span className="hero__pill">
              <Icon name="clock" size={16} />
              {stats.todayMinutes > 0
                ? `${formatMinutes(stats.todayMinutes)} hoy`
                : "Sin prisa"}
            </span>
          </div>
        </div>
        <div className="hero__art">
          <Capybara size={230} />
          <span className="hero__grade" aria-hidden="true">
            {grade}º
          </span>
        </div>
      </section>

      {heroUnit ? (
        <div className="dashboard-grid">
          <section className="mission" aria-labelledby="mission-title">
            <div className="mission__head">
              <span className="mission__label">La misión de hoy</span>
              <span className="mission__time">
                <Icon name="clock" size={15} /> {minutes} min
              </span>
            </div>
            <h2 id="mission-title">
              {studiedToday
                ? "Ya has estudiado hoy. Puedes cerrar aquí."
                : dueCount > 0
                  ? "Repasar lo que ya sabes"
                  : `Avanzar en ${heroUnit.title.toLowerCase()}`}
            </h2>
            <p className="mission__text">
              {studiedToday
                ? "Si te apetece una vuelta más, siempre es corta. Si no, mañana seguimos."
                : `Una sesión de ${size} preguntas sobre ${heroUnit.title.toLowerCase()}, con repaso de lo que está a punto de olvidarse.`}
            </p>
            <ol className="mission__steps">
              <li>
                <span className="mission__num">1</span>
                <span>Calentar con algo que ya sabes</span>
              </li>
              <li>
                <span className="mission__num">2</span>
                <span>Practicar: {nextSkill?.short}</span>
              </li>
              <li>
                <span className="mission__num">3</span>
                <span>Cerrar con una victoria</span>
              </li>
            </ol>
            <div className="mission__actions">
              <Link className="btn btn--primary" to={`/sesion/${heroUnit.id}`}>
                {studiedToday ? "Hacer una sesión corta" : "Empezar la misión"}
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link
                className="btn btn--ghost"
                to={`/materias/${heroUnit.subjectId}/${heroUnit.id}`}
              >
                Ver la unidad
              </Link>
            </div>
            <div className="mission__stamp" aria-hidden="true">
              <span>{studiedToday ? "Hecho" : "Hoy"}</span>
            </div>
          </section>

          <aside className="dashboard-side">
            <div className="stats-row">
              <StatCard
                icon="flame"
                value={stats.streak > 0 ? `${stats.streak}` : "0"}
                label={stats.streak === 1 ? "día seguido" : "días seguidos"}
                tone="coral"
              />
              <StatCard
                icon="clock"
                value={formatMinutes(stats.todayMinutes)}
                label="hoy"
                tone="marigold"
              />
              <StatCard
                icon="target"
                value={stats.totalAttempts > 0 ? `${stats.accuracy}%` : "—"}
                label="aciertos"
                tone="sky"
              />
              <StatCard
                icon="star"
                value={`${unlocked}`}
                label="pegatinas"
                tone="leaf"
              />
            </div>

            <section className="continue-card">
              <div className="continue-card__head">
                <span className="continue-card__icon">
                  <Icon name="book" size={20} />
                </span>
                <div>
                  <p className="continue-card__eyebrow">Sigue donde lo dejaste</p>
                  <h2>{heroUnit.title}</h2>
                </div>
              </div>
              <div className="continue-card__progress">
                <ProgressBar
                  value={unitMastery}
                  label="Dominio de la unidad"
                  size="md"
                />
                <span>{unitMastery}%</span>
              </div>
              <p className="continue-card__hint">
                {unitMastery === 0
                  ? "Aún no hay huella. La primera sesión abre el camino."
                  : masteryLabel(unitMastery)}
              </p>
              <Link
                className="link-arrow"
                to={`/materias/${heroUnit.subjectId}/${heroUnit.id}`}
              >
                Ver las {heroUnit.skills.length} habilidades{" "}
                <Icon name="arrow-right" size={16} />
              </Link>
            </section>
          </aside>
        </div>
      ) : null}

      <section className="section">
        <div className="section__head">
          <h2>Materias</h2>
          <Link className="link-arrow" to="/materias">
            Ver todas <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <div className="subject-grid">
          {studyableSubjects(grade).map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              mastery={subjectMastery(subject, stats.unitMastery)}
            />
          ))}
        </div>
      </section>

      <section className="tip-card">
        <span className="tip-card__icon">
          <Icon name="leaf" size={22} />
        </span>
        <div>
          <h2>La capibara dice</h2>
          <p>
            {studiedToday
              ? "Ya has hecho lo de hoy. Guardar el cuaderno también es estudiar."
              : dueCount > 0
                ? "Hay algo que ya sabías y pide una vuelta. Empieza por ahí: es la victoria más fácil."
                : "No hace falta empezar por lo más difícil. Empieza por lo que te haga decir «esto ya lo sé»."}
          </p>
        </div>
      </section>
    </div>
  );
}
