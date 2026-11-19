import { Capybara } from "../components/Capybara";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { StickerBadge } from "../components/StickerBadge";
import { useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { evaluateStickers, stickerProgressText } from "../lib/rewards";

export function Rewards() {
  const profile = useProfileContext();
  const stats = useLearningStats(profile.id);
  const stickers = evaluateStickers(stats);
  const unlocked = stickers.filter((sticker) => sticker.unlocked);
  const next = stickers
    .filter((sticker) => !sticker.unlocked)
    .sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tu colección"
        title="Premios"
        description="No se compran y no se pierden. Se ganan practicando, y se quedan aquí para siempre."
        actions={
          <span className="chip chip--warm">
            <Icon name="star" size={15} /> {unlocked.length} de {stickers.length}
          </span>
        }
      />

      <section className="rewards-hero">
        <div className="rewards-hero__art">
          <Capybara size={220} />
          <span className="rewards-hero__badge">
            <Icon name="medal" size={18} /> {unlocked.length}
          </span>
        </div>
        <div className="rewards-hero__copy">
          <h2>
            {unlocked.length === 0
              ? "La primera pegatina está a una sesión"
              : unlocked.length === stickers.length
                ? "¡Colección completa!"
                : "La capibara guarda tu colección"}
          </h2>
          <p>
            {next
              ? `La siguiente más cerca es «${next.name}». Va por ${stickerProgressText(next)}.`
              : "No queda ninguna por conseguir. Puedes seguir repasando para no perder el ritmo."}
          </p>
          <div className="rewards-hero__meta">
            <span>
              <strong>{stats.sessionsCount}</strong>{" "}
              {stats.sessionsCount === 1 ? "sesión" : "sesiones"}
            </span>
            <span>
              <strong>{stats.masteredSkills}</strong>{" "}
              {stats.masteredSkills === 1 ? "habilidad" : "habilidades"}
            </span>
            <span>
              <strong>{stats.streak}</strong>{" "}
              {stats.streak === 1 ? "día seguido" : "días seguidos"}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Todas las pegatinas</h2>
          <span className="chip chip--soft">Sin trampas</span>
        </div>
        <div className="sticker-grid">
          {stickers.map((sticker) => (
            <StickerBadge key={sticker.id} sticker={sticker} />
          ))}
        </div>
      </section>

      <p className="footnote">
        Las pegatinas son un recuerdo, no una nota. Si un día no puedes
        estudiar, no se rompe nada.
      </p>
    </div>
  );
}
