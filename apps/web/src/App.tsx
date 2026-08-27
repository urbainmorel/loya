import { AUTH_INTENTS, authIntentSchema, type AuthIntent } from "@loya/schemas";
import { useRef, useState, type FormEvent } from "react";

import {
  AUTH_DOORS,
  AUTH_FEEDBACK,
  unavailableFeedback,
  type AuthFeedback,
} from "./auth-model";
import { PwaUpdatePrompt, type PwaUpdatePromptProps } from "./PwaUpdatePrompt";

function DoorIcon({ intent }: { intent: AuthIntent }) {
  if (intent === "AGENCY") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M8 7h4M8 11h4M8 15h4M2 21h20M16 9h2a2 2 0 0 1 2 2v10" />
      </svg>
    );
  }

  if (intent === "TENANT") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-6h6v6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      />
      <path
        fill="#34a853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.4-4v2.6H3.3A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#fbbc05"
        d="M6.6 14.1a6 6 0 0 1 0-4V7.4H3.3a10 10 0 0 0 0 9.2l3.3-2.5Z"
      />
      <path
        fill="#ea4335"
        d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.7 5.4l3.3 2.6A5.8 5.8 0 0 1 12 6Z"
      />
    </svg>
  );
}

function Feedback({ state }: { state: AuthFeedback }) {
  if (state === "idle") return null;

  const feedback = AUTH_FEEDBACK[state];

  return (
    <p
      className={`feedback feedback--${feedback.tone}`}
      role={feedback.tone === "error" ? "alert" : "status"}
      aria-live={feedback.tone === "error" ? "assertive" : "polite"}
    >
      <span aria-hidden="true">{feedback.tone === "error" ? "!" : "i"}</span>
      {feedback.text}
    </p>
  );
}

interface AuthAccessPanelProps {
  intent: AuthIntent;
  onChangeDoor?: () => void;
  initialFeedback?: AuthFeedback;
}

export function AuthAccessPanel({
  intent,
  onChangeDoor,
  initialFeedback = "idle",
}: AuthAccessPanelProps) {
  const [feedback, setFeedback] = useState<AuthFeedback>(initialFeedback);
  const emailInput = useRef<HTMLInputElement>(null);
  const door = AUTH_DOORS[intent];

  function reportGoogleUnavailable() {
    setFeedback(unavailableFeedback(window.navigator.onLine));
    emailInput.current?.focus();
  }

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailInput.current?.checkValidity()) {
      setFeedback("invalid-email");
      emailInput.current?.focus();
      return;
    }

    setFeedback(window.navigator.onLine ? "email-unavailable" : "offline");
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-panel-title">
      <p className="auth-panel__eyebrow">Espace choisi</p>
      <h2 id="auth-panel-title">{door.panelTitle}</h2>
      <p className="auth-panel__help">{door.help}</p>

      <button
        className="button button--google"
        type="button"
        aria-label="Continuer avec Google"
        onClick={reportGoogleUnavailable}
      >
        <span className="google-mark">
          <GoogleMark />
        </span>
        Continuer avec Google
      </button>

      <div
        className="separator"
        role="separator"
        aria-label="ou continuer par e-mail"
      >
        <span>ou continuer par e-mail</span>
      </div>

      <form noValidate onSubmit={requestCode}>
        <label htmlFor="email">Adresse e-mail</label>
        <input
          ref={emailInput}
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          aria-describedby="email-feedback"
          aria-invalid={feedback === "invalid-email"}
          onChange={() => {
            if (feedback === "invalid-email") setFeedback("idle");
          }}
        />
        <button className="button button--secondary" type="submit">
          RECEVOIR UN CODE
        </button>
      </form>

      <div id="email-feedback">
        <Feedback state={feedback} />
      </div>

      <p className="legal">Confidentialité · Conditions d’utilisation</p>

      {onChangeDoor ? (
        <button className="change-door" type="button" onClick={onChangeDoor}>
          Changer d’espace
        </button>
      ) : null}
    </section>
  );
}

interface AppProps {
  pwaUpdate?: PwaUpdatePromptProps;
}

export function App({ pwaUpdate }: AppProps = {}) {
  const [selectedIntent, setSelectedIntent] = useState<AuthIntent | null>(null);
  const doorInputs = useRef<Partial<Record<AuthIntent, HTMLInputElement>>>({});

  return (
    <>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      {pwaUpdate ? <PwaUpdatePrompt {...pwaUpdate} /> : null}
      <main className="auth-shell" id="main-content" tabIndex={-1}>
        <header className="brand" aria-label="Loya">
          <span className="brand__mark" aria-hidden="true">
            L
          </span>
          <span className="brand__name">Loya</span>
          <span className="brand__tagline">
            GÉREZ. LOUEZ. EN TOUTE SÉRÉNITÉ.
          </span>
        </header>

        <section className="door-section" aria-labelledby="page-title">
          <p className="eyebrow">Bienvenue sur Loya</p>
          <h1 id="page-title">Choisissez votre espace</h1>
          <p className="intro">
            Retrouvez vos informations locatives dans l’espace qui correspond à
            votre besoin du moment.
          </p>

          <fieldset className="door-selector">
            <legend>Choisir l’espace de connexion</legend>
            <div className="door-grid">
              {AUTH_INTENTS.map((intent) => {
                const door = AUTH_DOORS[intent];
                const selected = intent === selectedIntent;

                return (
                  <label
                    className={`door-card${selected ? " door-card--selected" : ""}`}
                    key={intent}
                  >
                    <input
                      ref={(input) => {
                        if (input) {
                          doorInputs.current[intent] = input;
                        }
                      }}
                      type="radio"
                      name="auth-intent"
                      value={intent}
                      checked={selected}
                      onChange={(event) => {
                        setSelectedIntent(
                          authIntentSchema.parse(event.target.value),
                        );
                      }}
                    />
                    <span className="door-card__icon">
                      <DoorIcon intent={intent} />
                    </span>
                    <span className="door-card__title">{door.title}</span>
                    <span className="door-card__summary">{door.summary}</span>
                    <span className="door-card__state" aria-hidden={!selected}>
                      {selected ? "✓ Sélectionné" : "Sélectionner"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="account-note">
            Un seul compte Loya peut donner accès à plusieurs espaces.
          </p>
        </section>

        {selectedIntent ? (
          <AuthAccessPanel
            key={selectedIntent}
            intent={selectedIntent}
            onChangeDoor={() => {
              const previousIntent = selectedIntent;
              setSelectedIntent(null);
              doorInputs.current[previousIntent]?.focus();
            }}
          />
        ) : (
          <p className="selection-hint" role="status">
            Sélectionnez un espace pour afficher les options de connexion.
          </p>
        )}
      </main>
    </>
  );
}
