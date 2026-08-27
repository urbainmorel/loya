import { healthResponseSchema } from "@loya/schemas";
import { useEffect, useState } from "react";

type ApiState = "checking" | "ready" | "unavailable";

async function readApiHealth(signal: AbortSignal): Promise<void> {
  const response = await fetch("/v1/health", {
    cache: "no-store",
    credentials: "same-origin",
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error("API indisponible");
  }

  healthResponseSchema.parse(await response.json());
}

export function App() {
  const [apiState, setApiState] = useState<ApiState>("checking");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 5_000);

    void readApiHealth(controller.signal)
      .then(() => {
        if (active) setApiState("ready");
      })
      .catch(() => {
        if (active) setApiState("unavailable");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const status =
    apiState === "ready"
      ? "API Workers prête"
      : apiState === "unavailable"
        ? "API momentanément indisponible"
        : "Vérification de l’API";

  return (
    <main className="shell">
      <section className="brand" aria-labelledby="title">
        <span className="brand__mark" aria-hidden="true">
          L
        </span>
        <div>
          <p className="eyebrow">Gestion locative mobile-first</p>
          <h1 id="title">Loya</h1>
          <p className="tagline">Gérez. Louez. En toute sérénité.</p>
        </div>
      </section>

      <section className="proof" aria-labelledby="proof-title">
        <p className="proof__label">Preuve technique S0-006</p>
        <h2 id="proof-title">Le socle web et Worker communiquent.</h2>
        <p>
          Cette surface valide uniquement la PWA React/Vite et l’API Hono sous
          Cloudflare Workers. Aucun flux métier sensible n’est activé à ce
          stade.
        </p>
        <p
          className={`status status--${apiState}`}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true" />
          {status}
        </p>
      </section>
    </main>
  );
}
