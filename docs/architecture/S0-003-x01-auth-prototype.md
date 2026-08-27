# S0-003 — Prototype d’entrée Auth `X-01`

Statut : **prototype interactif local, authentification réelle non activée**.

Références normatives : ROADMAP, `S0-003` et `S0-007` ; DESIGN, §2.6 et §5.12 ; STI, §7. Ce document décrit une preuve d’implémentation et ne crée aucune règle métier.

## Portée prouvée

- `X-01` affiche immédiatement trois portes de même niveau, et uniquement `AGENCY`, `TENANT` et `OWNER`.
- Les portes sont des boutons radio natifs, sans présélection. Le libellé du groupe est « Choisir l’espace de connexion » et l’état sélectionné est lisible sans dépendre de la couleur.
- Après sélection, le panneau commun présente Google, le séparateur e-mail, l’adresse avec `autocomplete="email"`, « RECEVOIR UN CODE », puis confidentialité et conditions dans cet ordre.
- Les titres, résumés, aides et la phrase sur le compte unique reprennent les libellés normatifs du DESIGN.
- Les trois variantes utilisent le même composant et un type partagé fermé. `PLATFORM`, un rôle ou un identifiant métier sont refusés par le schéma.
- Les messages prévus couvrent chargement, redirection, annulation, fournisseur indisponible, hors-ligne, e-mail invalide et limite temporaire sans révéler si un compte existe.
- Les cartes sont empilées de 320 à 599 px et passent en trois colonnes à partir de 600 px. Les cibles font au moins 44 px, le focus possède une double bague et la réduction des animations est respectée.

## Invariants de sécurité

La porte choisie est une intention d’interface, jamais un rôle ni une permission. Le prototype ne la place ni dans `localStorage`, ni dans `sessionStorage`, ni dans un cookie, ni dans une URL. Il ne contacte aucun fournisseur et ne construit aucune URL OAuth. Les boutons rendent donc un état neutre « temporairement indisponible » ou « hors ligne » et ne simulent aucun succès.

Le navigateur ne pourra activer Supabase Auth que lorsqu’une continuation serveur opaque ou signée préservera l’intention et une invitation éventuelle à travers OAuth. Sa durée de vie doit être décidée dans `OQ-014`. Après authentification, seules les appartenances et invitations réelles pourront autoriser un contexte.

## Preuves exécutables

- `packages/schemas/src/auth.test.ts` ferme l’ensemble des intentions publiques et refuse notamment `PLATFORM` et `ADMIN`.
- `apps/web/src/App.test.tsx` vérifie les trois portes sans présélection, l’absence de porte Plateforme, les trois variantes de panneau, l’ordre Google/e-mail/OTP et tous les messages neutres.
- `e2e/x01.spec.ts` rejoue dans Chromium le contrat initial, l’ordre clavier, les retours de focus, l’e-mail invalide, le hors-ligne et la frontière responsive 599/600 px sans débordement.
- `e2e/pwa-update.spec.ts` force un cycle réel du Service Worker dans trois onglets et vérifie, sur ce scénario, la conservation des saisies e-mail `X-01`, du focus et du consentement au rechargement.
- Le build Vite/PWA et les contrôles TypeScript/lint restent obligatoires dans `pnpm check`.

La suite E2E est configurée par `playwright.config.ts`, démarre une preview neuve du build PWA et s’exécute dans le contrôle GitHub obligatoire après installation de Chromium. Un échec CI conserve les diagnostics Playwright pendant sept jours. En local : `pnpm exec playwright install chromium`, puis `pnpm test:e2e`.

## Hors portée de cette preuve

Ce prototype ne prouve pas Google OAuth/PKCE, l’OTP, SMTP, la convergence d’identité, les callbacks, `X-02..X-06`, MFA, une invitation ou une autorisation métier. Il ne justifie donc ni le passage de `GATE-0`, ni l’état vert de `S0-003` ou `S0-007`. L’activation réseau nécessitera la configuration Auth expurgée par environnement, la continuation serveur, les tests réels et les décisions de configuration encore ouvertes.

Le contrôle Google devra également être validé avec les éléments de marque officiels au branchement du fournisseur. Le prompt accessible de mise à jour PWA est une décision d’implémentation, pas une règle ajoutée aux sources : le cycle multi-onglet testé ne recharge que les onglets qui y consentent. `X-02` étant absent, la même preuve reste obligatoire pour l’OTP lors de son implémentation. Les E2E actuels ne remplacent pas encore un audit lecteur d’écran, zoom 200 % et reflow 400 % complet.
