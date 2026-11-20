import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Activity } from "../../data/types";
import { useProfileContext } from "../../context/ProfileContext";
import {
  activityTypeLabel,
  checkInputAnswer,
  correctAnswerText,
  difficultyLabel,
} from "../../lib/answers";
import { shuffle } from "../../lib/session";
import { speak, speechAvailable } from "../../lib/voice";
import { Icon } from "../../components/Icon";

export function ActivityView({
  activity,
  skillName,
  onCheck,
  onNext,
  isLast,
}: {
  activity: Activity;
  skillName: string;
  onCheck: (correct: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const profile = useProfileContext();
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [connections, setConnections] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  const [rightOrder] = useState(() =>
    activity.type === "match" ? shuffle(activity.pairs) : [],
  );
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (checked) nextRef.current?.focus();
  }, [checked]);

  useEffect(() => {
    if (activity.type === "input") {
      inputRef.current?.focus();
    } else {
      promptRef.current?.focus();
    }
  }, [activity]);

  const allMatched =
    activity.type === "match" && connections.length === activity.pairs.length;

  const canCheck =
    !checked &&
    ((activity.type === "choice" && selected !== null) ||
      (activity.type === "input" && text.trim().length > 0) ||
      allMatched);

  function resolveCorrect(): boolean {
    if (activity.type === "choice") return selected === activity.correct;
    if (activity.type === "input")
      return checkInputAnswer(text, activity.answers);
    return allMatched;
  }

  function check() {
    if (!canCheck) return;
    const result = resolveCorrect();
    setCorrect(result);
    setChecked(true);
    onCheck(result);
  }

  function handleMatchRight(pairId: string) {
    if (!selectedLeft || checked || !("pairs" in activity)) return;
    if (activity.type !== "match") return;

    // Antes de comprobar, una conexión ya hecha puede deshacerse para
    // corregirla: desconectar o volver a elegir.
    if (connections.includes(pairId)) {
      setConnections((current) => current.filter((id) => id !== pairId));
      setSelectedLeft(null);
      setWrongRight(null);
      return;
    }

    const selectedPair = activity.pairs.find((pair) => pair.id === selectedLeft);
    if (selectedPair && selectedPair.id === pairId) {
      setConnections((current) => [...current, pairId]);
      setSelectedLeft(null);
      setWrongRight(null);
      return;
    }

    setMistakes((value) => value + 1);
    setWrongRight(pairId);
  }

  function submitInput(event: FormEvent) {
    event.preventDefault();
    if (!checked) check();
  }

  return (
    <div className="activity">
      <div className="activity__meta">
        <span className="chip chip--soft">{difficultyLabel(activity.difficulty)}</span>
        <span className="activity__type">{activityTypeLabel(activity)}</span>
        <span className="activity__skill">{skillName}</span>
      </div>

      <div className="activity__prompt-row">
        <h2 className="activity__prompt" ref={promptRef} tabIndex={-1}>
          {activity.prompt}
        </h2>
        {profile.settings.voice && speechAvailable() ? (
          <button
            className="icon-btn"
            type="button"
            onClick={() => speak(activity.prompt)}
            aria-label="Escuchar la pregunta"
            title="Escuchar la pregunta"
          >
            <Icon name="volume" size={19} />
          </button>
        ) : null}
      </div>

      {activity.type === "choice" ? (
        <div className="choice-list" role="group" aria-label="Opciones">
          {activity.options.map((option, index) => {
            const isSelected = selected === index;
            const isCorrect = activity.correct === index;
            const tone = checked
              ? isCorrect
                ? "option--correct"
                : isSelected
                  ? "option--wrong"
                  : "option--muted"
              : isSelected
                ? "option--selected"
                : "";
            return (
              <button
                key={option}
                type="button"
                className={`option ${tone}`}
                aria-pressed={isSelected}
                disabled={checked}
                onClick={() => setSelected(index)}
              >
                <span className="option__letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {checked && isCorrect ? (
                  <Icon name="check" size={18} />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {activity.type === "input" ? (
        <form className="input-form" onSubmit={submitInput}>
          <label className="field">
            <span className="field__label">Tu respuesta</span>
            <span className="input-wrap">
              <input
                ref={inputRef}
                className="input input--answer"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={activity.placeholder ?? "Escribe aquí"}
                disabled={checked}
                autoComplete="off"
                inputMode="numeric"
              />
              {activity.suffix ? (
                <span className="input-wrap__suffix">{activity.suffix}</span>
              ) : null}
            </span>
          </label>
        </form>
      ) : null}

      {activity.type === "match" ? (
        <div className="match" role="group" aria-label="Une las parejas">
          <div className="match__column">
            <p className="match__label">Columna A</p>
            {activity.pairs.map((pair) => {
              const done = connections.includes(pair.id);
              return (
                <button
                  key={pair.id}
                  type="button"
                  className={`match__item ${done ? "match__item--done" : ""} ${
                    selectedLeft === pair.id ? "match__item--selected" : ""
                  }`}
                  aria-pressed={selectedLeft === pair.id}
                  disabled={checked || done}
                  onClick={() => {
                    setSelectedLeft(pair.id);
                    setWrongRight(null);
                  }}
                >
                  <span>{pair.left}</span>
                  {done ? <Icon name="check" size={16} /> : null}
                </button>
              );
            })}
          </div>
          <div className="match__column">
            <p className="match__label">Columna B</p>
            {rightOrder.map((pair) => {
              const done = connections.includes(pair.id);
              return (
                <button
                  key={pair.id}
                  type="button"
                  className={`match__item ${done ? "match__item--done" : ""} ${
                    wrongRight === pair.id ? "match__item--wrong" : ""
                  }`}
                  disabled={checked || done}
                  onClick={() => handleMatchRight(pair.id)}
                >
                  <span>{pair.right}</span>
                  {done ? <Icon name="check" size={16} /> : null}
                </button>
              );
            })}
          </div>
          <p className="match__status" aria-live="polite">
            {wrongRight
              ? "Esa no es. Prueba con otra."
              : selectedLeft
                ? "Ahora elige su pareja en la columna B."
                : allMatched
                  ? "Todo emparejado. Comprueba cuando quieras."
                  : "Elige una ficha de la columna A."}
          </p>
        </div>
      ) : null}

      {activity.hint && !checked ? (
        <div className="hint-box">
          {showHint ? (
            <p>{activity.hint}</p>
          ) : (
            <button
              className="link-button"
              type="button"
              onClick={() => setShowHint(true)}
            >
              ¿Una pista?
            </button>
          )}
        </div>
      ) : null}

      {!checked ? (
        <div className="activity__actions">
          <button
            className="btn btn--primary btn--big"
            type="button"
            disabled={!canCheck}
            onClick={check}
          >
            Comprobar
            <Icon name="check" size={18} />
          </button>
        </div>
      ) : (
        <div
          className={`feedback ${correct ? "feedback--ok" : "feedback--no"}`}
          role="status"
          aria-live="polite"
        >
          <div className="feedback__head">
            <span className="feedback__icon">
              <Icon name={correct ? "check" : "spark"} size={20} />
            </span>
            <div>
              <p className="feedback__title">
                {correct
                  ? mistakes > 0
                    ? "Lo has completado"
                    : "¡Bien!"
                  : "Casi. Esto te lo explico."}
              </p>
              <p className="feedback__text">{activity.explanation}</p>
            </div>
          </div>
          {!correct ? (
            <p className="feedback__answer">
              Respuesta correcta: <strong>{correctAnswerText(activity)}</strong>
            </p>
          ) : null}
          <button
            ref={nextRef}
            className="btn btn--ink btn--big feedback__next"
            type="button"
            onClick={onNext}
          >
            {isLast ? "Ver resultado" : "Siguiente"}
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
