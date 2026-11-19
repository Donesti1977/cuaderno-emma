import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { getFrequentErrors, resetProgress } from "../db/repo";
import {
  downloadBackup,
  exportBackup,
  importBackup,
  type Backup,
} from "../db/backup";
import { findActivity, findSkill, findUnit } from "../data/lookup";
import { formatMinutes, formatShortDate, formatTime } from "../lib/dates";
import { weekSummaryText } from "../lib/stats";
import { useAppStore } from "../store/appStore";

interface ErrorRow {
  activityId: string;
  count: number;
}

export function Parent() {
  const profile = useProfileContext();
  const stats = useLearningStats(profile.id);
  const showToast = useAppStore((state) => state.showToast);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<Backup | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) return;
    void getFrequentErrors(profile.id, 5).then(setErrors);
  }, [unlocked, profile.id, stats.totalAttempts]);

  function unlock(event: FormEvent) {
    event.preventDefault();
    if (pin === profile.settings.parentPin) {
      setUnlocked(true);
      setPin("");
      setPinError("");
    } else {
      setPinError("Ese PIN no es. Prueba otra vez.");
    }
  }

  async function handleExport() {
    const backup = await exportBackup(profile.id);
    downloadBackup(backup);
    showToast("Copia descargada. Guárdala en un lugar seguro.", "success");
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Backup;
      setPendingImport(parsed);
    } catch {
      showToast("No he podido leer ese archivo.", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    try {
      await importBackup(profile.id, pendingImport);
      setPendingImport(null);
      showToast("Copia restaurada. El progreso ya está de vuelta.", "success");
    } catch {
      showToast("La copia no es válida o es de otra versión.", "error");
    }
  }

  async function confirmReset() {
    await resetProgress(profile.id);
    setResetOpen(false);
    showToast("Progreso borrado. El perfil sigue aquí.", "success");
  }

  if (!unlocked) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Zona tranquila"
          title="Para padres"
          description="Aquí están los datos del cuaderno y las herramientas de copia. El acceso es solo para adultos."
        />
        <div className="pin-card">
          <span className="pin-card__icon">
            <Icon name="lock" size={26} />
          </span>
          <h2>Escribe el PIN</h2>
          <p>
            Si no lo has cambiado, el PIN inicial es <strong>1234</strong>. Se
            puede cambiar en Ajustes.
          </p>
          <form onSubmit={unlock} className="pin-form">
            <label className="field">
              <span className="field__label">PIN de padres</span>
              <input
                className="input input--pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, ""));
                  setPinError("");
                }}
                autoFocus
              />
            </label>
            {pinError ? (
              <p className="field__error" role="alert">
                {pinError}
              </p>
            ) : null}
            <button className="btn btn--primary" type="submit" disabled={pin.length < 4}>
              Entrar <Icon name="arrow-right" size={18} />
            </button>
          </form>
          <p className="pin-card__note">
            El PIN es una cortina, no una caja fuerte: los datos viven en este
            dispositivo y no se envían a ningún sitio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Zona de padres"
        title="Para padres"
        description="Una vista serena de lo que está pasando: tiempo, constancia, errores que se repiten y una copia de seguridad."
        actions={
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setUnlocked(false)}
          >
            <Icon name="lock" size={17} /> Cerrar
          </button>
        }
      />

      <div className="stats-row stats-row--wide">
        <StatCard
          icon="book"
          value={`${stats.sessionsCount}`}
          label={stats.sessionsCount === 1 ? "sesión" : "sesiones"}
          tone="sky"
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
          tone="leaf"
        />
        <StatCard
          icon="circle-check"
          value={`${stats.masteredSkills}`}
          label="habilidades"
          tone="coral"
        />
      </div>

      <div className="parent-grid">
        <section className="panel">
          <div className="section__head">
            <h2>Esta semana</h2>
            <span className="chip chip--soft">Sin comparaciones</span>
          </div>
          <p className="panel__lead">{weekSummaryText(stats.week)}</p>
          <div className="mini-week" role="list" aria-label="Minutos por día">
            {(() => {
              const max = Math.max(
                1,
                ...stats.week.map((item) => item.minutes),
              );
              return stats.week.map((day) => (
                <div key={day.key} className="mini-week__day" role="listitem">
                  <span className="mini-week__bar">
                    {day.minutes > 0 ? (
                      <span
                        style={{
                          height: `${Math.max(12, (day.minutes / max) * 100)}%`,
                        }}
                      />
                    ) : null}
                  </span>
                  <span>{day.label}</span>
                  <span className="mini-week__value">{day.minutes}</span>
                </div>
              ));
            })()}
          </div>
          <p className="panel__note">
            {stats.streak > 0
              ? `Racha actual: ${stats.streak} ${stats.streak === 1 ? "día" : "días"}.`
              : "Todavía no hay racha. Un día cuenta."}
          </p>
        </section>

        <section className="panel">
          <div className="section__head">
            <h2>Errores que se repiten</h2>
            <span className="chip chip--warm">{errors.length}</span>
          </div>
          {errors.length > 0 ? (
            <ul className="error-list">
              {errors.map((row) => {
                const activity = findActivity(row.activityId);
                return (
                  <li key={row.activityId}>
                    <span className="error-list__count">{row.count}×</span>
                    <span>{activity?.prompt ?? "Actividad retirada"}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="panel__note">
              Sin errores repetidos. Si aparece alguno, aquí se verá la pregunta
              exacta para poder repasarla juntos.
            </p>
          )}
        </section>

        <section className="panel">
          <div className="section__head">
            <h2>Habilidades que conviene mirar</h2>
            <span className="chip chip--soft">{stats.weakSkills.length}</span>
          </div>
          {stats.weakSkills.length > 0 ? (
            <ul className="weak-list">
              {stats.weakSkills.slice(0, 6).map((item) => {
                const skill = findSkill(item.skillId);
                return (
                  <li key={item.skillId}>
                    <span>
                      <strong>{skill?.short ?? item.skillId}</strong>
                      <span>{item.mastery}% de dominio</span>
                    </span>
                    <span className="weak-list__bar">
                      <span style={{ width: `${item.mastery}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="panel__note">
              Ninguna habilidad por debajo del 60 %. Buen momento para ampliar.
            </p>
          )}
        </section>

        <section className="panel">
          <div className="section__head">
            <h2>Últimas sesiones</h2>
            <Link className="link-arrow" to="/progreso">
              Ver progreso <Icon name="arrow-right" size={15} />
            </Link>
          </div>
          {stats.sessions.length > 0 ? (
            <ul className="session-list">
              {stats.sessions.slice(0, 6).map((session) => {
                const unit = findUnit(session.unitId);
                return (
                  <li key={session.id}>
                    <span className="session-list__date">
                      {formatShortDate(session.endedAt)}
                      <small>{formatTime(session.endedAt)}</small>
                    </span>
                    <span className="session-list__unit">
                      {unit?.title ?? "Unidad"}
                    </span>
                    <span className="session-list__score">
                      {session.correct}/{session.total}
                    </span>
                    <span className="session-list__minutes">
                      {formatMinutes(session.minutes)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="panel__note">Aún no hay sesiones terminadas.</p>
          )}
        </section>
      </div>

      <section className="section">
        <div className="section__head">
          <h2>Datos y copia de seguridad</h2>
          <span className="chip chip--soft">Solo en este dispositivo</span>
        </div>
        <div className="data-actions">
          <button className="data-action" type="button" onClick={handleExport}>
            <span className="data-action__icon">
              <Icon name="download" size={21} />
            </span>
            <span>
              <strong>Descargar copia</strong>
              <span>Un archivo JSON con el perfil, el progreso y las sesiones.</span>
            </span>
          </button>
          <button
            className="data-action"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            <span className="data-action__icon">
              <Icon name="upload" size={21} />
            </span>
            <span>
              <strong>Restaurar copia</strong>
              <span>Reemplaza el progreso actual por el del archivo.</span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <button
            className="data-action data-action--danger"
            type="button"
            onClick={() => setResetOpen(true)}
          >
            <span className="data-action__icon">
              <Icon name="trash" size={21} />
            </span>
            <span>
              <strong>Borrar progreso</strong>
              <span>Mantiene el perfil y los ajustes. No se puede deshacer.</span>
            </span>
          </button>
        </div>
        <p className="panel__note">
          Guarda una copia de vez en cuando, sobre todo antes de cambiar de
          dispositivo. Los datos no salen de aquí: no hay cuentas ni servidores.
        </p>
      </section>

      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="¿Borrar todo el progreso?"
        footer={
          <>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setResetOpen(false)}
            >
              Cancelar
            </button>
            <button className="btn btn--danger" type="button" onClick={confirmReset}>
              Sí, borrar
            </button>
          </>
        }
      >
        <p>
          Se borrarán las sesiones, los intentos y el dominio de las
          habilidades. El perfil, el nombre y los ajustes se quedan.
        </p>
      </Dialog>

      <Dialog
        open={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        title="¿Restaurar esta copia?"
        footer={
          <>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setPendingImport(null)}
            >
              Cancelar
            </button>
            <button className="btn btn--primary" type="button" onClick={confirmImport}>
              Restaurar
            </button>
          </>
        }
      >
        <p>
          El progreso actual se reemplazará por el de la copia. El nombre y los
          ajustes del perfil no cambian.
        </p>
        {pendingImport ? (
          <p className="dialog__meta">
            Copia del {new Date(pendingImport.exportedAt).toLocaleDateString("es-ES")}
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
