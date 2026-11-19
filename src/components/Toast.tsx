import { useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { Icon } from "./Icon";

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 3400);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.tone}`} role="status" aria-live="polite">
      <Icon
        name={toast.tone === "success" ? "circle-check" : toast.tone === "error" ? "alert" : "spark"}
        size={18}
      />
      <span>{toast.message}</span>
    </div>
  );
}
