import { useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { Capybara } from "./components/Capybara";
import { Toast } from "./components/Toast";
import { ProfileProvider } from "./context/ProfileContext";
import { useProfiles } from "./db/hooks";
import { Dashboard } from "./pages/Dashboard";
import { Onboarding } from "./pages/Onboarding";
import { Parent } from "./pages/Parent";
import { Progress } from "./pages/Progress";
import { Rewards } from "./pages/Rewards";
import { SessionPage } from "./pages/SessionPage";
import { Settings } from "./pages/Settings";
import { SubjectPage } from "./pages/SubjectPage";
import { Subjects } from "./pages/Subjects";
import { UnitPage } from "./pages/UnitPage";
import { useAppStore } from "./store/appStore";

function Splash() {
  return (
    <div className="splash">
      <Capybara size={150} />
      <p>Abriendo el cuaderno...</p>
    </div>
  );
}

function SessionRoute() {
  const { unitId } = useParams();
  const profileId = useAppStore((state) => state.profileId);
  const { profiles, loading } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);

  if (loading) return <Splash />;
  if (!profile) return <Navigate to="/" replace />;

  return (
    <ProfileProvider profile={profile}>
      <SessionPage key={unitId} />
      <Toast />
    </ProfileProvider>
  );
}

export function App() {
  const profileId = useAppStore((state) => state.profileId);
  const setProfileId = useAppStore((state) => state.setProfileId);
  const { profiles, loading } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId) ?? null;

  useEffect(() => {
    if (loading) return;
    if (profileId && !profiles.some((item) => item.id === profileId)) {
      setProfileId(null);
    }
  }, [loading, profileId, profiles, setProfileId]);

  if (loading) return <Splash />;
  if (!profile) return <Onboarding />;

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell profile={profile} />}>
          <Route index element={<Dashboard />} />
          <Route path="materias" element={<Subjects />} />
          <Route path="materias/:subjectId" element={<SubjectPage />} />
          <Route path="materias/:subjectId/:unitId" element={<UnitPage />} />
          <Route path="progreso" element={<Progress />} />
          <Route path="premios" element={<Rewards />} />
          <Route path="padres" element={<Parent />} />
          <Route path="ajustes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="sesion/:unitId" element={<SessionRoute />} />
      </Routes>
    </HashRouter>
  );
}
