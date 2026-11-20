import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Capybara } from "../components/Capybara";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { useActiveGrade, useProfileContext } from "../context/ProfileContext";
import { useLearningStats, useProgressState } from "../db/hooks";
import { recordAnswer, saveSession } from "../db/repo";
import { findSubjectOfUnit, findUnit } from "../data/lookup";
import type { Activity, LearningSession } from "../data/types";
import { formatMinutes } from "../lib/dates";
import { evaluateStickers } from "../lib/rewards";
import {
  createSession,
  sessionSize,
  starsFor,
  summaryMessage,
} from "../lib/session";
import { useAppStore } from "../store/appStore";
import { ActivityView } from "../features/activities/ActivityView";

interface Summary {
  correct: number;
  total: number;
  minutes: number;
  startedAt: string;
  endedAt: string;
}

export function SessionPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const profile = useProfileContext();
  const grade = useActiveGrade();
  const unit = findUnit(unitId, grade);
  const subject = unit ? findSubjectOfUnit(unit) : undefined;
  const { progress, loading } = useProgressState(profile.id);
  const stats = useLearningStats(profile.id, grade);
  const showToast = useAppStore((state) => state.showToast);

  const [items, setItems] = useState<Activity[] | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [exitOpen, setExitOpen] = useState(false);

  const resultsRef = useRef<{ activityId: string; correct: boolean }[]>([]);
  const startedAtRef = useRef(new Date());
  const sessionIdRef = useRef(crypto.randomUUID());
  const savedRef = useRef(false);

  useEffect(() => {
    if (!unit || unit.status !== "ready" || loading || items !== null) return;
    setItems(
      createSession(unit, progress, sessionSize(profile.settings.dailyGoal)),
    );
  }, [unit, loading, progress, items, profile.settings.dailyGoal]);

  if (!unit || !subject) {
    return (
      <div className="session-empty">
        <Capybara size={200} />
        <h1>No encuentro esta sesión</h1>
        <p>Puede que el enlace esté mal o que la unidad aún no esté lista.</p>
        <Link className="btn btn--primary" to="/materias">
          Volver a materias
        </Link>
      </div>
    );
  }

  if (unit.status !== "ready") {
    return (
      <div className="session-empty">
        <Capybara size={200} />
        <h1>Esta unidad todavía se está preparando</h1>
        <p>
          Mientras tanto, puedes practicar con {subject.shortName} desde
          Materias.
        </p>
        <Link className="btn btn--primary" to={`/materias/${unit.subjectId}`}>
          Volver a materias
        </Link>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="session-empty">
        <Capybara size={180} />
        <p>Preparando la sesión...</p>
      </div>
    );
  }

  const current = items[index];
  const activeUnit = unit;
  const activeSubject = subject;
  const skillName =
    activeUnit.skills.find((skill) => skill.id === current.skillId)?.short ?? "";

  function handleCheck(correct: boolean) {
    resultsRef.current = [
      ...resultsRef.current,
      { activityId: current.id, correct },
    ];
    void recordAnswer(
      profile.id,
      sessionIdRef.current,
      current,
      correct,
    ).catch(() => {
      showToast("No se pudo guardar la respuesta. Sigue practicando.", "error");
    });
  }

  function finish() {
    if (!items || savedRef.current) return;
    savedRef.current = true;

    const endedAt = new Date();
    const total = items.length;
    const correct = resultsRef.current.filter((result) => result.correct).length;
    const minutes = Math.max(
      1,
      Math.round((endedAt.getTime() - startedAtRef.current.getTime()) / 60_000),
    );
    const session: LearningSession = {
      id: sessionIdRef.current,
      profileId: profile.id,
      unitId: activeUnit.id,
      subjectId: activeUnit.subjectId,
      startedAt: startedAtRef.current.toISOString(),
      endedAt: endedAt.toISOString(),
      total,
      correct,
      minutes,
    };

    void saveSession(session).catch(() => {
      showToast("La sesión no se pudo guardar en el dispositivo.", "error");
    });

    setSummary({
      correct,
      total,
      minutes,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    });
    setFinished(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleNext() {
    if (!items) return;
    if (index + 1 >= items.length) {
      finish();
    } else {
      setIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function restart() {
    setItems(null);
    setIndex(0);
    setFinished(false);
    setSummary(null);
    resultsRef.current = [];
    savedRef.current = false;
    startedAtRef.current = new Date();
    sessionIdRef.current = crypto.randomUUID();
  }

  function confirmExit() {
    setExitOpen(false);
    navigate(`/materias/${activeSubject.id}/${activeUnit.id}`);
  }

  const style = {
    "--subject": subject.color,
    "--subject-soft": subject.soft,
  } as CSSProperties;

  if (finished && summary) {
    const stars = starsFor(summary.correct, summary.total);
    const stickers = evaluateStickers(stats).filter(
      (sticker) => sticker.unlocked,
    ).length;
    const practicedSkills = [
      ...new Set(
        items.map(
          (activity) =>
            unit.skills.find((skill) => skill.id === activity.skillId)?.short ??
            "",
        ),
      ),
    ].filter(Boolean);

    return (
      <div className="session session--summary" style={style}>
        <div className="summary">
          <Capybara size={230} className="summary__capybara" />
          <p className="summary__kicker">Sesión completada</p>
          <h1>{summaryMessage(summary.correct, summary.total)}</h1>
          <div className="summary__stars" aria-label={`${stars} de 3 estrellas`}>
            {[1, 2, 3].map((value) => (
              <span
                key={value}
                className={`summary__star ${value <= stars ? "summary__star--on" : ""}`}
              >
                <Icon name="star" size={30} />
              </span>
            ))}
          </div>
          <div className="summary__numbers">
            <span>
              <strong>
                {summary.correct}/{summary.total}
              </strong>
              aciertos
            </span>
            <span>
              <strong>{formatMinutes(summary.minutes)}</strong>
              de estudio
            </span>
            <span>
              <strong>{stickers}</strong>
              {stickers === 1 ? "pegatina" : "pegatinas"}
            </span>
          </div>
          <div className="summary__skills">
            <p>Has practicado</p>
            <ul>
              {practicedSkills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="summary__actions">
            <Link className="btn btn--primary btn--big" to="/">
              Volver al escritorio
              <Icon name="home" size={18} />
            </Link>
            <button className="btn btn--ghost btn--big" type="button" onClick={restart}>
              <Icon name="refresh" size={18} /> Otra sesión
            </button>
          </div>
          <Link className="link-arrow summary__unit" to={`/materias/${subject.id}/${unit.id}`}>
            Ver la unidad <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="session" style={style}>
      <header className="session__bar">
        <button
          className="icon-btn"
          type="button"
          onClick={() => setExitOpen(true)}
          aria-label="Salir de la sesión"
          title="Salir"
        >
          <Icon name="x" size={22} />
        </button>
        <div className="session__progress">
          <ProgressBar
            value={((index + 1) / items.length) * 100}
            label={`Pregunta ${index + 1} de ${items.length}`}
            size="sm"
          />
          <span>
            {index + 1} de {items.length}
          </span>
        </div>
        <span className="session__subject">
          <Icon name={subject.icon} size={17} />
          {subject.shortName}
        </span>
      </header>

      <main className="session__main">
        <div className="session__card">
          <ActivityView
            key={current.id}
            activity={current}
            skillName={skillName}
            onCheck={handleCheck}
            onNext={handleNext}
            isLast={index === items.length - 1}
          />
        </div>
      </main>

      <Dialog
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="¿Dejar la sesión?"
        footer={
          <>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setExitOpen(false)}
            >
              Seguir practicando
            </button>
            <button className="btn btn--ink" type="button" onClick={confirmExit}>
              Salir
            </button>
          </>
        }
      >
        <p>
          Las respuestas que ya has hecho se guardan. La sesión completa no
          contará como terminada.
        </p>
      </Dialog>
    </div>
  );
}
