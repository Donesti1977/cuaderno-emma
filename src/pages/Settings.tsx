import { useEffect, useState } from "react";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { useProfileContext } from "../context/ProfileContext";
import { useProfiles } from "../db/hooks";
import { deleteProfile, updateProfile, updateSettings } from "../db/repo";
import { GRADES, type Grade } from "../data/types";
import { speak, speechAvailable } from "../lib/voice";
import { useAppStore } from "../store/appStore";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="toggle-row">
      <span className="toggle-row__copy">
        <strong>{label}</strong>
        <span>{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle" aria-hidden="true">
        <span className="toggle__dot" />
      </span>
    </label>
  );
}

function InstallCard() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return (
    <div className="install-card">
      <span className="install-card__icon">
        <Icon name="download" size={23} />
      </span>
      <div className="install-card__copy">
        <h2>Llevar el cuaderno contigo</h2>
        <p>
          {installed
            ? "Ya está instalado en este dispositivo."
            : "Se puede instalar como una app y abrir sin conexión. En iPad: Compartir → Añadir a pantalla de inicio."}
        </p>
      </div>
      {prompt ? (
        <button
          className="btn btn--ink"
          type="button"
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice;
            setPrompt(null);
          }}
        >
          Instalar
        </button>
      ) : null}
    </div>
  );
}

export function Settings() {
  const profile = useProfileContext();
  const { profiles } = useProfiles();
  const showToast = useAppStore((state) => state.showToast);
  const setProfileId = useAppStore((state) => state.setProfileId);
  const [name, setName] = useState(profile.name);
  const [pin, setPin] = useState(profile.settings.parentPin);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setPin(profile.settings.parentPin);
  }, [profile.name, profile.settings.parentPin]);

  async function saveName() {
    if (!name.trim()) return;
    await updateProfile(profile.id, { name: name.trim() });
    showToast("Nombre guardado.", "success");
  }

  async function savePin() {
    if (!/^\d{4}$/.test(pin)) {
      showToast("El PIN tiene que tener cuatro cifras.", "error");
      return;
    }
    await updateSettings(profile.id, { parentPin: pin });
    showToast("PIN actualizado.", "success");
  }

  async function confirmDelete() {
    await deleteProfile(profile.id);
    setDeleteOpen(false);
    setProfileId(null);
  }

  const voiceAvailable = speechAvailable();

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tu cuaderno"
        title="Ajustes"
        description="Todo se puede cambiar. Nada se rompe por probar."
      />

      <div className="settings-grid">
        <section className="settings-card">
          <div className="section__head">
            <h2>Tu perfil</h2>
            <span className="chip chip--soft">{profile.grade}º de Primaria</span>
          </div>
          <label className="field">
            <span className="field__label">Nombre</span>
            <span className="inline-form">
              <input
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
              />
              <button className="btn btn--ink" type="button" onClick={saveName}>
                Guardar
              </button>
            </span>
          </label>
          <label className="field">
            <span className="field__label">Curso</span>
            <select
              className="input"
              value={profile.grade}
              onChange={(event) =>
                void updateProfile(profile.id, {
                  grade: Number(event.target.value) as Grade,
                })
              }
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}º de Primaria
                </option>
              ))}
            </select>
          </label>
          {profile.grade !== 3 ? (
            <p className="field__hint">
              El contenido completo de 3º es el que está listo. El resto se irá
              añadiendo al mapa.
            </p>
          ) : null}
        </section>

        <section className="settings-card">
          <div className="section__head">
            <h2>Tu ritmo</h2>
            <span className="chip chip--soft">Se puede cambiar</span>
          </div>
          <p className="settings-card__lead">
            ¿Cuánto quieres que dure una sesión normal?
          </p>
          <div className="goal-grid goal-grid--compact" role="radiogroup" aria-label="Tiempo diario">
            {[5, 10, 15, 20].map((goal) => (
              <button
                key={goal}
                type="button"
                role="radio"
                aria-checked={profile.settings.dailyGoal === goal}
                className={`goal-option ${profile.settings.dailyGoal === goal ? "goal-option--on" : ""}`}
                onClick={() =>
                  void updateSettings(profile.id, {
                    dailyGoal: goal as 5 | 10 | 15 | 20,
                  })
                }
              >
                <strong>{goal} min</strong>
                <span>{goal === 10 ? "El ritmo justo" : goal < 10 ? "Un sorbo" : "Con calma"}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <div className="section__head">
            <h2>Accesibilidad</h2>
            <span className="chip chip--soft">A tu medida</span>
          </div>
          <div className="field">
            <span className="field__label">Tamaño del texto</span>
            <div className="segmented" role="radiogroup" aria-label="Tamaño del texto">
              {[
                { value: "normal" as const, label: "Normal" },
                { value: "grande" as const, label: "Grande" },
                { value: "muy-grande" as const, label: "Muy grande" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={profile.settings.fontSize === option.value}
                  className={profile.settings.fontSize === option.value ? "is-on" : ""}
                  onClick={() =>
                    void updateSettings(profile.id, { fontSize: option.value })
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <Toggle
            checked={profile.settings.dyslexiaFont}
            onChange={(value) =>
              void updateSettings(profile.id, { dyslexiaFont: value })
            }
            label="Fuente para dislexia"
            description="Cambia a Atkinson Hyperlegible, con letras más distinguibles."
          />
          <Toggle
            checked={profile.settings.reduceMotion}
            onChange={(value) =>
              void updateSettings(profile.id, { reduceMotion: value })
            }
            label="Reducir movimiento"
            description="Menos transiciones y animaciones. También se respeta la preferencia del sistema."
          />
        </section>

        <section className="settings-card">
          <div className="section__head">
            <h2>Voz</h2>
            <span className="chip chip--soft">{voiceAvailable ? "Disponible" : "No disponible"}</span>
          </div>
          <Toggle
            checked={profile.settings.voice}
            onChange={(value) =>
              void updateSettings(profile.id, { voice: value })
            }
            label="Leer las preguntas en voz alta"
            description="Muestra un botón de altavoz en las actividades y usa la voz del dispositivo."
          />
          <button
            className="btn btn--ghost"
            type="button"
            disabled={!voiceAvailable}
            onClick={() => speak("Hola. Vamos a estudiar con calma.")}
          >
            <Icon name="volume" size={18} /> Probar la voz
          </button>
          {!voiceAvailable ? (
            <p className="field__hint">
              Este navegador no ofrece voz. Las actividades siguen funcionando
              con texto.
            </p>
          ) : null}
        </section>

        <section className="settings-card">
          <div className="section__head">
            <h2>PIN de padres</h2>
            <span className="chip chip--soft">4 cifras</span>
          </div>
          <p className="settings-card__lead">
            Protege el panel de datos y la copia de seguridad. Es una cortina,
            no una caja fuerte.
          </p>
          <label className="field">
            <span className="field__label">Nuevo PIN</span>
            <span className="inline-form">
              <input
                className="input input--pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, ""))
                }
              />
              <button className="btn btn--ink" type="button" onClick={savePin}>
                Guardar
              </button>
            </span>
          </label>
        </section>

        <section className="settings-card">
          <div className="section__head">
            <h2>Perfiles</h2>
            <span className="chip chip--soft">{profiles.length}</span>
          </div>
          <ul className="profile-list">
            {profiles.map((item) => (
              <li key={item.id} className={item.id === profile.id ? "is-current" : ""}>
                <span className="profile-list__avatar">
                  {item.name.charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <span>{item.grade}º de Primaria</span>
                </span>
                {item.id === profile.id ? (
                  <span className="chip chip--success">Ahora</span>
                ) : (
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => setProfileId(item.id)}
                  >
                    Cambiar
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setProfileId(null)}
          >
            <Icon name="plus" size={17} /> Crear otro perfil
          </button>
        </section>
      </div>

      <InstallCard />

      <section className="danger-zone">
        <div>
          <h2>Borrar este perfil</h2>
          <p>
            Elimina el perfil, el progreso y las sesiones de este dispositivo.
            No se puede deshacer.
          </p>
        </div>
        <button
          className="btn btn--danger"
          type="button"
          onClick={() => setDeleteOpen(true)}
        >
          <Icon name="trash" size={17} /> Borrar perfil
        </button>
      </section>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`¿Borrar el perfil de ${profile.name}?`}
        footer={
          <>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </button>
            <button className="btn btn--danger" type="button" onClick={confirmDelete}>
              Sí, borrar todo
            </button>
          </>
        }
      >
        <p>
          Se borrarán el perfil, las respuestas, las sesiones y las pegatinas.
          Antes puedes descargar una copia desde el panel de padres.
        </p>
        <p className="dialog__meta">
          Perfil: {profile.name} · {profile.grade}º de Primaria
        </p>
      </Dialog>
    </div>
  );
}
