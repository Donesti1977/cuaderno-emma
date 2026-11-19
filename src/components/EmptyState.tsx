import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function EmptyState({
  icon = "spark",
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} size={26} />
      </span>
      <h2>{title}</h2>
      {children ? <div className="empty-state__body">{children}</div> : null}
    </div>
  );
}
