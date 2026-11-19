import { useState, type FormEvent } from "react";
import { Capybara } from "../components/Capybara";
import { Icon } from "../components/Icon";
import { createProfile, updateSettings } from "../db/repo";
import { useProfiles } from "../db/hooks";
import { GRADES, type Grade } from "../data/types";
import { useAppStore } from "../store/appStore";

const goals = [
  { value: 5 as const, title: "5 minutos", text: "Un sorbo. Para días con prisa." },
  { value: 10 as const, title: "10 minutos", text: "El ritmo justo. Ocho preguntas." },
  { value: 15 as const, title: "15 minutos", text: "Una sesión tranquila y completa." },
  { value: 20 as const, title: "20 minutos", text: "Para días con energía de sobra." },
];

export function Onboarding() {
  const { profiles, loading } = useProfiles();
  const setProfileId = useAppStore((state) => state.setProfileId);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>(3);
  const [goal, setGoal] = useState<5 | 10 | 15 | 20>(10);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const profile = await createProfile(name, grade);
      if (goal !== 10) {
        await updateSettings(profile.id, { dailyGoal: goal });
      }
      setProfileId(profile.id);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="splash">Preparando el cuaderno...</div>;
  }

  return (
    <div className="onboarding">
      <div className="onboarding__art">
        <div className="onboarding__stamp">3º de Primaria</div>
        <Capybara size={340} className="onboarding__capybara" />
        <p className="onboarding__quote">
          «Estudiar no tiene que ser una carrera. Solo hay que volver mañana.»
        </p>
      </div>

      <div className="onboarding__panel">
        {profiles.length > 0 ? (
          <section className="returning" aria-label="Perfiles de este dispositivo">
            <p className="returning__title">Ya hay un cuaderno aquí</p>
            <div className="returning__list">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className="returning__item"
                  onClick={() => setProfileId(profile.id)}
                >
                  <span className="returning__avatar">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <strong>{profile.name}</strong>
                    <span>{profile.grade}º de Primaria</span>
                  </span>
                  <Icon name="arrow-right" size={18} />
                </button>
              ))}
            </div>
            <p className="returning__or">o crea otro perfil</p>
          </section>
        ) : null}

        <form onSubmit={submit} className="onboarding__form">
          <div className="step-dots" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`step-dots__dot ${index === step ? "step-dots__dot--on" : ""}`}
              />
            ))}
          </div>

          {step === 0 ? (
            <div className="onboarding__step">
              <p className="onboarding__kicker">Bienvenida</p>
              <h1>¿Cómo te llamas?</h1>
              <p className="onboarding__text">
                Este cuaderno es tuyo. Solo necesito un nombre para saludarte
                cada mañana.
              </p>
              <label className="field">
                <span className="field__label">Tu nombre</span>
                <input
                  className="input input--big"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Emma"
                  autoComplete="given-name"
                  maxLength={24}
                  autoFocus
                />
              </label>
              <div className="onboarding__actions">
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => setStep(1)}
                >
                  Continuar <Icon name="arrow-right" size={18} />
                </button>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="onboarding__step">
              <p className="onboarding__kicker">Tu curso</p>
              <h1>¿En qué curso estás?</h1>
              <p className="onboarding__text">
                El contenido de 3º es el primero que está listo. Los demás
                cursos irán llegando a su ritmo.
              </p>
              <div className="grade-grid" role="radiogroup" aria-label="Curso">
                {GRADES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={grade === value}
                    className={`grade-option ${grade === value ? "grade-option--on" : ""}`}
                    onClick={() => setGrade(value)}
                  >
                    <span>{value}º</span>
                    {value === 3 ? <small>Contenido listo</small> : <small>En camino</small>}
                  </button>
                ))}
              </div>
              {grade !== 3 ? (
                <p className="onboarding__note">
                  Puedes empezar igualmente, pero por ahora las actividades
                  completas son de 3º.
                </p>
              ) : null}
              <div className="onboarding__actions">
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setStep(0)}
                >
                  <Icon name="arrow-left" size={17} /> Atrás
                </button>
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Continuar <Icon name="arrow-right" size={18} />
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="onboarding__step">
              <p className="onboarding__kicker">Tu ritmo</p>
              <h1>¿Cuánto quieres estudiar cada día?</h1>
              <p className="onboarding__text">
                Se puede cambiar cuando quieras. Lo importante es que quepan
                las ganas.
              </p>
              <div className="goal-grid" role="radiogroup" aria-label="Tiempo diario">
                {goals.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={goal === option.value}
                    className={`goal-option ${goal === option.value ? "goal-option--on" : ""}`}
                    onClick={() => setGoal(option.value)}
                  >
                    <strong>{option.title}</strong>
                    <span>{option.text}</span>
                  </button>
                ))}
              </div>
              <div className="onboarding__actions">
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <Icon name="arrow-left" size={17} /> Atrás
                </button>
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? "Preparando..." : "Entrar en mi cuaderno"}
                  {!saving ? <Icon name="arrow-right" size={18} /> : null}
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
