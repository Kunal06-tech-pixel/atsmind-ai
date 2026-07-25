import { useCallback, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { ToastContext } from "./ToastContextBase";

const toneMap = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200/70 text-emerald-900",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200/70 text-red-900",
    iconClassName: "text-red-600",
  },
  warning: {
    icon: AlertCircle,
    className: "border-amber-200/70 text-amber-900",
    iconClassName: "text-amber-600",
  },
  info: {
    icon: Info,
    className: "border-white/70 text-slate-900",
    iconClassName: "text-slate-500",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = "info", title, message, duration = 4200 }) => {
      const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const toast = {
        id,
        type,
        title: title || (type === "error" ? "Something went wrong" : "Notice"),
        message,
      };

      setToasts((current) => [toast, ...current].slice(0, 4));
      window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: pushToast,
      success: (message, title = "Done") =>
        pushToast({ type: "success", title, message }),
      error: (message, title = "Action needed") =>
        pushToast({ type: "error", title, message }),
      warning: (message, title = "Check this") =>
        pushToast({ type: "warning", title, message }),
      info: (message, title = "Notice") =>
        pushToast({ type: "info", title, message }),
      dismiss,
    }),
    [dismiss, pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[120] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const tone = toneMap[toast.type] || toneMap.info;
          const Icon = tone.icon;

          return (
            <div
              key={toast.id}
              className={`liquid-glass-strong flex items-start gap-3 rounded-2xl border p-4 ${tone.className}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${tone.iconClassName}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message && (
                  <p className="mt-1 text-sm leading-5 opacity-80">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
