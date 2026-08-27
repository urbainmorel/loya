import { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";

import { App } from "./App";
import type { PwaUpdatePhase } from "./PwaUpdatePrompt";
import "./styles.css";

export function LoyaRoot() {
  const focusBeforePrompt = useRef<HTMLElement | null>(null);
  const promptFocusCaptured = useRef(false);
  const reloadRequested = useRef(false);
  const [updatePhase, setUpdatePhase] = useState<PwaUpdatePhase | null>(null);

  function restoreFocusBeforePrompt() {
    const focusTarget = focusBeforePrompt.current;
    focusBeforePrompt.current = null;
    promptFocusCaptured.current = false;

    if (focusTarget?.isConnected) {
      focusTarget.focus();
    } else {
      document.querySelector<HTMLElement>("#main-content")?.focus();
    }
  }

  const { updateServiceWorker } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      if (!promptFocusCaptured.current) {
        const activeElement = document.activeElement;
        focusBeforePrompt.current =
          activeElement instanceof HTMLElement &&
          activeElement !== document.body
            ? activeElement
            : null;
        promptFocusCaptured.current = true;
      }
      setUpdatePhase("available");
    },
    onNeedReload() {
      if (reloadRequested.current) {
        window.location.reload();
        return;
      }

      if (document.activeElement?.classList.contains("pwa-update__dismiss")) {
        restoreFocusBeforePrompt();
      }
      setUpdatePhase("ready");
    },
  });

  function applyUpdate() {
    if (updatePhase === "ready") {
      window.location.reload();
      return;
    }

    reloadRequested.current = true;
    setUpdatePhase("updating");
    void Promise.resolve(updateServiceWorker()).catch(() => {
      reloadRequested.current = false;
      setUpdatePhase("error");
    });
  }

  const pwaUpdate = updatePhase
    ? {
        phase: updatePhase,
        onDismiss() {
          reloadRequested.current = false;
          restoreFocusBeforePrompt();
          setUpdatePhase(null);
        },
        onUpdate: applyUpdate,
      }
    : null;

  return <App {...(pwaUpdate ? { pwaUpdate } : {})} />;
}

const root = document.querySelector<HTMLDivElement>("#root");

if (!root) {
  throw new Error("Racine React introuvable");
}

createRoot(root).render(
  <StrictMode>
    <LoyaRoot />
  </StrictMode>,
);
