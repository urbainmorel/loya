import type { AuthIntent } from "@loya/schemas";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { App, AuthAccessPanel } from "./App";
import { AUTH_DOORS, AUTH_FEEDBACK, unavailableFeedback } from "./auth-model";
import { PwaUpdatePrompt, type PwaUpdatePhase } from "./PwaUpdatePrompt";

describe("X-01", () => {
  it("rend exactement trois portes publiques sans présélection", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html).not.toContain("checked");
    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Aller au contenu");
    expect(html).toContain("Choisir l’espace de connexion");
    expect(html).toContain("Accéder à l’espace Agence");
    expect(html).toContain("Accéder à l’espace Locataire");
    expect(html).toContain("Accéder à l’espace Propriétaire");
    expect(html).toContain(
      "Un seul compte Loya peut donner accès à plusieurs espaces.",
    );
    expect(html).not.toContain("Connexion Plateforme");
    expect(html).not.toContain("Super Admin");
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).not.toContain("Continuer avec Google");
  });

  it.each(Object.keys(AUTH_DOORS) as AuthIntent[])(
    "rend le panneau commun normatif pour %s",
    (intent) => {
      const html = renderToStaticMarkup(<AuthAccessPanel intent={intent} />);
      const door = AUTH_DOORS[intent];

      expect(html).toContain(door.panelTitle);
      expect(html).toContain(door.help);
      expect(html.indexOf("Continuer avec Google")).toBeLessThan(
        html.indexOf("Adresse e-mail"),
      );
      expect(html.indexOf("Adresse e-mail")).toBeLessThan(
        html.indexOf("RECEVOIR UN CODE"),
      );
      expect(html).toContain('autoComplete="email"');
      expect(html).toContain("Confidentialité · Conditions d’utilisation");
      expect(html).not.toContain("mot de passe");
    },
  );

  it("prévoit des messages neutres pour tous les états X-01", () => {
    for (const state of Object.keys(AUTH_FEEDBACK)) {
      const feedbackState = state as keyof typeof AUTH_FEEDBACK;
      const html = renderToStaticMarkup(
        <AuthAccessPanel intent="TENANT" initialFeedback={feedbackState} />,
      );

      expect(html).toContain(AUTH_FEEDBACK[feedbackState].text);
      expect(html.toLowerCase()).not.toContain("compte existe");
      expect(html.toLowerCase()).not.toContain("compte inexistant");
    }

    expect(unavailableFeedback(true)).toBe("provider-unavailable");
    expect(unavailableFeedback(false)).toBe("offline");
    expect(AUTH_FEEDBACK["provider-unavailable"].text).toContain(
      "continuer par e-mail",
    );
  });
});

describe("mise à jour PWA", () => {
  it.each<{
    phase: PwaUpdatePhase;
    message: string;
    action: string;
    dismissAction: string | null;
  }>([
    {
      phase: "available",
      message: "Une nouvelle version de Loya est disponible.",
      action: "Mettre à jour et recharger",
      dismissAction: "Plus tard",
    },
    {
      phase: "updating",
      message: "Mise à jour en cours…",
      action: "Mise à jour…",
      dismissAction: "Continuer sans recharger",
    },
    {
      phase: "ready",
      message: "La nouvelle version est prête. Rechargez pour l’utiliser.",
      action: "Recharger maintenant",
      dismissAction: null,
    },
    {
      phase: "error",
      message: "La mise à jour n’a pas pu être appliquée. Réessayez.",
      action: "Mettre à jour et recharger",
      dismissAction: "Plus tard",
    },
  ])("rend l’état $phase sans action automatique", (state) => {
    const onDismiss = vi.fn();
    const onUpdate = vi.fn();
    const html = renderToStaticMarkup(
      <PwaUpdatePrompt
        phase={state.phase}
        onDismiss={onDismiss}
        onUpdate={onUpdate}
      />,
    );

    expect(html).toContain('aria-labelledby="pwa-update-title"');
    expect(html).not.toContain("aria-busy");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('aria-live="assertive"');
    expect(html).toContain(state.message);
    expect(html).toContain(state.action);
    if (state.dismissAction) {
      expect(html).toContain(state.dismissAction);
    } else {
      expect(html).not.toContain("Plus tard");
      expect(html).not.toContain("Continuer sans recharger");
    }
    expect(onDismiss).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("place l’annonce après le lien d’évitement et avant le contenu", () => {
    const html = renderToStaticMarkup(
      <App
        pwaUpdate={{
          phase: "available",
          onDismiss: vi.fn(),
          onUpdate: vi.fn(),
        }}
      />,
    );

    expect(html.indexOf("Aller au contenu")).toBeLessThan(
      html.indexOf("Mise à jour de Loya"),
    );
    expect(html.indexOf("Mise à jour de Loya")).toBeLessThan(
      html.indexOf('id="main-content"'),
    );
    expect(html.match(/<h1/g)).toHaveLength(1);
  });
});
