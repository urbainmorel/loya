export type PwaUpdatePhase = "available" | "updating" | "ready" | "error";

export interface PwaUpdatePromptProps {
  phase: PwaUpdatePhase;
  onDismiss: () => void;
  onUpdate: () => void;
}

const UPDATE_MESSAGES: Record<PwaUpdatePhase, string> = {
  available: "Une nouvelle version de Loya est disponible.",
  updating: "Mise à jour en cours…",
  ready: "La nouvelle version est prête. Rechargez pour l’utiliser.",
  error: "La mise à jour n’a pas pu être appliquée. Réessayez.",
};

export function PwaUpdatePrompt({
  phase,
  onDismiss,
  onUpdate,
}: PwaUpdatePromptProps) {
  const updating = phase === "updating";
  const ready = phase === "ready";

  return (
    <aside className="pwa-update" aria-labelledby="pwa-update-title">
      <div>
        <p className="pwa-update__title" id="pwa-update-title">
          Mise à jour de Loya
        </p>
        <p className="pwa-update__message" role="status" aria-live="polite">
          {UPDATE_MESSAGES[phase]}
        </p>
        <p className="pwa-update__detail">
          Votre saisie reste inchangée tant que vous ne rechargez pas.
        </p>
      </div>

      <div className="pwa-update__actions">
        <button
          className="button button--secondary"
          type="button"
          disabled={updating}
          onClick={onUpdate}
        >
          {updating
            ? "Mise à jour…"
            : ready
              ? "Recharger maintenant"
              : "Mettre à jour et recharger"}
        </button>
        {!ready ? (
          <button
            className="button button--secondary pwa-update__dismiss"
            type="button"
            onClick={onDismiss}
          >
            {updating ? "Continuer sans recharger" : "Plus tard"}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
