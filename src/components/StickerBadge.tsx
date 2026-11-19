import type { CSSProperties } from "react";
import { stickerProgressText, type StickerState } from "../lib/rewards";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

export function StickerBadge({ sticker }: { sticker: StickerState }) {
  const style = { "--sticker": sticker.color } as CSSProperties;
  return (
    <article
      className={`sticker ${sticker.unlocked ? "sticker--on" : "sticker--off"}`}
      style={style}
    >
      <span className="sticker__seal" aria-hidden="true">
        <Icon name={sticker.icon} size={26} />
      </span>
      <div className="sticker__copy">
        <h3>{sticker.name}</h3>
        <p>{sticker.description}</p>
        {!sticker.unlocked ? (
          <div className="sticker__progress">
            <ProgressBar
              value={sticker.ratio * 100}
              label={`Progreso para conseguir ${sticker.name}`}
              size="sm"
              tone="ink"
            />
            <span>{stickerProgressText(sticker)}</span>
          </div>
        ) : (
          <span className="sticker__won">
            <Icon name="check" size={14} /> Conseguida
          </span>
        )}
      </div>
    </article>
  );
}
