import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function BackLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="back-link" to={to}>
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <header className="page-head">
      {back ? <BackLink to={back.to}>{back.label}</BackLink> : null}
      {eyebrow ? <p className="page-head__eyebrow">{eyebrow}</p> : null}
      <div className="page-head__row">
        <div className="page-head__copy">
          <h1>{title}</h1>
          {description ? <p className="page-head__desc">{description}</p> : null}
        </div>
        {actions ? <div className="page-head__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
