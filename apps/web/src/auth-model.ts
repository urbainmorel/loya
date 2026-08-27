import type { AuthIntent } from "@loya/schemas";

interface AuthDoor {
  title: string;
  summary: string;
  panelTitle: string;
  help: string;
}

export const AUTH_DOORS = {
  AGENCY: {
    title: "Accéder à l’espace Agence",
    summary: "Gérer mon agence",
    panelTitle: "Connexion Agence",
    help: "Après la connexion, vous pourrez créer ou rejoindre une agence. L’activation des paiements exigera ensuite les vérifications FedaPay.",
  },
  TENANT: {
    title: "Accéder à l’espace Locataire",
    summary: "Consulter et payer mes loyers",
    panelTitle: "Connexion Locataire",
    help: "Votre logement apparaîtra après acceptation de l’invitation envoyée par votre agence.",
  },
  OWNER: {
    title: "Accéder à l’espace Propriétaire",
    summary: "Suivre mes biens et mes loyers",
    panelTitle: "Connexion Propriétaire",
    help: "Vos biens apparaîtront après acceptation de l’invitation envoyée par votre agence.",
  },
} as const satisfies Record<AuthIntent, AuthDoor>;

export type AuthFeedback =
  | "idle"
  | "loading-intent"
  | "redirecting-google"
  | "google-cancelled"
  | "provider-unavailable"
  | "email-unavailable"
  | "offline"
  | "invalid-email"
  | "temporarily-limited";

interface FeedbackMessage {
  tone: "info" | "warning" | "error";
  text: string;
}

export const AUTH_FEEDBACK = {
  "loading-intent": {
    tone: "info",
    text: "Préparation de votre espace de connexion…",
  },
  "redirecting-google": {
    tone: "info",
    text: "Ouverture de la connexion Google…",
  },
  "google-cancelled": {
    tone: "warning",
    text: "Connexion Google annulée. Vous pouvez continuer par e-mail.",
  },
  "provider-unavailable": {
    tone: "warning",
    text: "Connexion Google temporairement indisponible. Vous pouvez continuer par e-mail.",
  },
  "email-unavailable": {
    tone: "warning",
    text: "Envoi du code temporairement indisponible. Réessayez plus tard.",
  },
  offline: {
    tone: "warning",
    text: "Connexion indisponible hors ligne. Réessayez une fois connecté.",
  },
  "invalid-email": {
    tone: "error",
    text: "Saisissez une adresse e-mail valide.",
  },
  "temporarily-limited": {
    tone: "warning",
    text: "Trop de tentatives. Réessayez plus tard.",
  },
} as const satisfies Record<Exclude<AuthFeedback, "idle">, FeedbackMessage>;

export function unavailableFeedback(isOnline: boolean): AuthFeedback {
  return isOnline ? "provider-unavailable" : "offline";
}
