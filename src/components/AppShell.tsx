import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLearningStats } from "../db/hooks";
import type { Profile } from "../data/types";
import { ProfileProvider, useActiveGrade } from "../context/ProfileContext";
import { CourseSelector } from "./CourseSelector";
import { Icon } from "./Icon";
import { Toast } from "./Toast";

const primaryNav = [
  { to: "/", label: "Escritorio", icon: "home", end: true },
  { to: "/materias", label: "Materias", icon: "book" },
  { to: "/progreso", label: "Progreso", icon: "chart" },
  { to: "/premios", label: "Premios", icon: "star" },
];

const homeNav = [
  { to: "/padres", label: "Para padres", icon: "users" },
  { to: "/ajustes", label: "Ajustes", icon: "settings" },
];

const mobileNav = [
  { to: "/", label: "Inicio", icon: "home", end: true },
  { to: "/materias", label: "Materias", icon: "book" },
  { to: "/progreso", label: "Progreso", icon: "chart" },
  { to: "/premios", label: "Premios", icon: "star" },
  { to: "/ajustes", label: "Ajustes", icon: "settings" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand ${compact ? "brand--compact" : ""}`} to="/">
      <img
        className="brand__mark"
        src={`${import.meta.env.BASE_URL}iconos/icon-192.png`}
        width={compact ? 32 : 44}
        height={compact ? 32 : 44}
        alt=""
        aria-hidden="true"
      />
      <span className="brand__text">
        <span className="brand__name">El cuaderno de Emma</span>
        <span className="brand__sub">{useActiveGrade()}º de Primaria</span>
      </span>
    </Link>
  );
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={`${import.meta.env.BASE_URL}iconos/icon-192.png`}
        alt=""
        width={size}
        height={size}
      />
      <span className="avatar__initial">{name.charAt(0).toUpperCase()}</span>
    </span>
  );
}

function StreakPill({ streak }: { streak: number }) {
  return (
    <span className={`streak-pill ${streak > 0 ? "streak-pill--on" : ""}`}>
      <Icon name="flame" size={17} />
      <span>
        {streak > 0 ? `${streak} ${streak === 1 ? "día" : "días"}` : "Empieza"}
      </span>
    </span>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return `nav-link ${isActive ? "nav-link--active" : ""}`;
}

function RailNav({ profile }: { profile: Profile }) {
  const grade = useActiveGrade();
  const stats = useLearningStats(profile.id, grade);

  return (
    <aside className="rail">
      <Brand />
      <CourseSelector />
      <nav className="rail__nav" aria-label="Principal">
        <p className="rail__label">Estudiar</p>
        {primaryNav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <p className="rail__label rail__label--spaced">En casa</p>
        {homeNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="rail__foot">
        <Link className="profile-chip" to="/ajustes">
          <Avatar name={profile.name} />
          <span className="profile-chip__text">
            <strong>{profile.name}</strong>
            <span>{useActiveGrade()}º de Primaria</span>
          </span>
          <StreakPill streak={stats.streak} />
        </Link>
      </div>
    </aside>
  );
}

function MobileHeader({ profile }: { profile: Profile }) {
  const stats = useLearningStats(profile.id, useActiveGrade());

  return (
    <header className="mobile-head">
      <Brand compact />
      <div className="mobile-head__right">
        <StreakPill streak={stats.streak} />
        <Link to="/ajustes" aria-label="Ajustes y perfil">
          <Avatar name={profile.name} size={32} />
        </Link>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegación principal">
      {mobileNav.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
          <Icon name={item.icon} size={21} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function OfflineNotice() {
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-notice" role="status">
      <Icon name="wifi-off" size={16} />
      Sin conexión. El cuaderno sigue funcionando.
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);
  return null;
}

export function AppShell({ profile }: { profile: Profile }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontSize = profile.settings.fontSize;
    root.dataset.dyslexia = String(profile.settings.dyslexiaFont);
    root.dataset.reduceMotion = String(profile.settings.reduceMotion);
  }, [profile.settings]);

  return (
    <ProfileProvider profile={profile}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <div className="shell">
        <RailNav profile={profile} />
        <div className="shell__body">
          <MobileHeader profile={profile} />
          <OfflineNotice />
          <main id="contenido" className="shell__content">
            <Outlet />
          </main>
        </div>
        <MobileNav />
      </div>
      <ScrollToTop />
      <Toast />
    </ProfileProvider>
  );
}
