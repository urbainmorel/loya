# ROADMAP — Implémentation de Gestion Locative IA V1

> Plan d’exécution autonome destiné à Codex
>
> - Produit ciblé : **Loya V1**
> - Portée : ordre de réalisation, dépendances, preuves, portes de qualité et critères de livraison complets
> - Ensemble d’implémentation courant : [PRD](./PRD_Gestion_Locative_IA_V1.md), [STI](./STI_Gestion_Locative_IA_V1.md) et [DESIGN](./DESIGN_Gestion_Locative_IA_V1.md)
> - Statut : **normatif et prêt pour exécution**

## 0. Contrat d’exécution pour Codex

1. Lire les quatre documents avant de créer le premier ticket technique.
2. Exécuter les sprints dans l’ordre 0 à 5. Une porte de sortie non franchie bloque le sprint suivant pour les dépendances concernées.
3. Ne jamais contourner une dépendance financière ou de sécurité pour accélérer une démo.
4. Chaque ticket cite au moins une exigence `FR-*`, `BR-*`, `AC-*` ou `NFR-*`, une section du STI et, s’il touche l’UI, un écran `X-*`, `A-*`, `L-*`, `O-*`, `S-*` ou `N-*` du DESIGN. L’index d’exécution de la section 16 fournit ce rattachement pour chaque tâche.
5. Marquer une tâche terminée uniquement avec des preuves concrètes : code, configuration, migration, tests, rapport de validation, capture responsive ou runbook selon le cas.
6. Aucun ticket ne doit créer une fonctionnalité exclue : paiement/remboursement partiel, contrat, état des lieux, maintenance, signalement, rapport avancé, import, CSV propriétaire, remboursement FedaPay in-app, suivi de balance fournisseur, reversement/retrait/remise de fonds au Propriétaire, solde restant à reverser, preuve de reversement, mot de passe local, OTP téléphone ou authentification SMS/WhatsApp.
7. Le socle imposé est React/Vite PWA + Cloudflare Workers + Supabase Auth/Postgres/Storage/Queues. Il est interdit de dupliquer Supabase Auth par des tables maison de session, OTP ou identité, ou de substituer Next.js, Fastify, Redis/BullMQ, D1 ou une autre base dans le périmètre Loya V1. Codex ne doit implémenter aucune substitution sans instruction explicite du commanditaire.
8. Les durées et dates calendaires dépendent de l’équipe réelle. Ne pas inventer une date de livraison ; estimer après les preuves du Sprint 0.

## 1. Stratégie de livraison

La V1 est construite par tranches verticales sécurisées :

| Sprint | Résultat vérifiable | Dépendance principale |
|---|---|---|
| 0 | contrats fournisseurs et preuves techniques validés | aucune |
| 1 | fondation sécurisée multi-agence | Sprint 0 |
| 2 | référentiels, affectations et échéances reproductibles | Sprint 1 |
| 3 | cycle financier complet en sandbox et manuel | Sprints 1–2 |
| 4 | quatre espaces finis, responsive et accessibles | Sprints 2–3 |
| 5 | pilote durci, observable et récupérable | Sprints 0–4 |

### 1.1 Chemin critique

1. Contrats FedaPay, configuration Supabase Auth, OTP e-mail, ledger, RLS, Queues et topologie Cloudflare sont décidés.
2. Identité Supabase, rattachements métier, multi-tenancy, transactions, inbox/outbox et files Supabase sont opérationnels.
3. Affectations, échéances et snapshots de taux sont fiables.
4. Ledger est livré avant activation des paiements réels ou manuels.
5. Ordres, webhooks, paiements, reçus, disponibilités Propriétaire déclarées manuellement et notifications passent les scénarios critiques.
6. Les quatre interfaces passent la matrice responsive et l’accessibilité.
7. Restauration, sécurité et pilote sont validés avant ouverture progressive.

### 1.2 Ordre des incréments financiers

Ne pas inverser cet ordre :

```text
formules et états purs
→ schéma, contraintes et RLS
→ ledger équilibré
→ commande manuelle en environnement de test
→ PaymentOrder et réservations
→ devis et compte marchand FedaPay versionnés
→ demande de tentative durable par outbox
→ adaptateur FedaPay sandbox
→ webhook/inbox/Supabase Queue/worker Cloudflare
→ reçus, état `TO_CONFIRM`, déclaration Agence, notifications et rapprochement
→ pilote réel limité
```

## 2. Règles de gestion du backlog

### 2.1 Priorités

- **P0** : sécurité, isolation, exactitude financière, idempotence, reprise, conformité bloquante.
- **P1** : parcours essentiel de chaque contexte et accessibilité.
- **P2** : confort autorisé n’altérant ni scope ni modèle.

Une tâche P2 ne retarde jamais un correctif P0 ou une porte de qualité.

### 2.2 Definition of Ready

Un ticket est prêt si :

- le besoin et l’acteur sont identifiés ;
- les références PRD/STI/DESIGN sont indiquées ;
- les règles d’autorisation et d’Agence sont explicites ;
- les données et migrations éventuelles sont listées ;
- les états UI et largeurs de test sont connus ;
- les cas positifs, négatifs, concurrence et reprise sont définis ;
- aucun point externe non validé n’est présenté comme certain.

### 2.3 Gabarit de ticket Codex

```md
## [ID] Titre orienté résultat

Références : PRD FR/BR/NFR · STI section · DESIGN écran
Portée :
Hors portée :
Permissions et isolation :
Schéma/API/événements :
États UI et responsive :
Tests requis :
Observabilité et audit :
Migration/rollback :
Preuves de fin :
```

### 2.4 Taille et revue

- Une pull request livre un comportement cohérent et réversible.
- Séparer migration d’expansion, bascule applicative et contraction destructrice.
- Toute logique financière reçoit une revue renforcée et des tests de non-régression.
- Toute donnée multi-agence inclut migration, RLS, FKs composites et tests inter-agences.
- Toute UI financière inclut captures 360/320 px et largeur desktop applicable.

## 3. Sprint 0 — Décisions et preuves

### 3.1 Objectif

Éliminer les hypothèses externes ou structurantes avant de bâtir les flux sensibles. Les preuves de ce sprint sont exécutables et versionnées ; un spike n’entre en production qu’après revue.

### 3.2 Tâches

#### `S0-001` — Baseline documentaire et traçabilité — P0

- Figer le PRD, le STI, le DESIGN et la ROADMAP courants comme ensemble normatif unique.
- Générer la matrice exigences → tâches → écrans → tests.
- Automatiser la détection des fonctions exclues, des références orphelines et des divergences de stack.
- Formaliser les règles de périmètre, la configuration technique et le protocole de migration.

Preuves : commit signé, index reproductible, configuration contrôlée et rapport anti-périmètre.

#### `S0-002` — Contrat FedaPay — P0

Valider par documentation officielle, sandbox et interlocuteur compétent :

- sous-comptes/marketplace, KYB Agence, compte marchand, devise XOF et états fournisseur ;
- corps brut, signature, horodatage, anti-rejeu, identifiant d’événement et retries ;
- devis de frais supportés par le Locataire, expiration et relation principal + frais = total débité ;
- Mobile Money et carte hébergée par FedaPay, sans donnée carte dans Loya ;
- `merchantReference`, idempotence, interrogation après timeout et double charge ;
- relecture par compte marchand et fenêtre temporelle après restauration ;
- règles de remboursement intégral exécuté hors Loya.

Consigner explicitement que :

- `PAID` décrit un loyer confirmé et ne dépend pas de la disponibilité réelle des fonds FedaPay ;
- `TO_CONFIRM` et `AVAILABLE_WITH_AGENCY` sont déclarés manuellement dans Loya et ne proviennent jamais de FedaPay ;
- Loya n’exécute, ne confirme et ne suit aucun reversement au Propriétaire.

Preuves : fixtures expurgées, rapport sandbox, tests de contrat FedaPay, table de mapping versionnée et test de concurrence.

#### `S0-003` — Supabase Auth et trois portes — P0

- Configurer le modèle standard Supabase Auth : Google OAuth et OTP e-mail, sans mot de passe.
- Prouver la convergence standard vers le même `auth.users.id` lorsque Google et OTP partagent une adresse vérifiée.
- Définir URLs de redirection exactes par environnement, domaines autorisés, PKCE géré par le SDK et scopes Google minimaux.
- Configurer un SMTP transactionnel de production, limites d’envoi, expiration et réponses anti-énumération.
- Prototyper les trois portes publiques Agence/Locataire/Propriétaire comme intentions de navigation non autorisantes.
- Prouver qu’aucun callback Auth ne crée rôle, Agence, profil, bien ou capacité FedaPay.
- Définir MFA TOTP `aal2` et réauthentification pour Super Admin et opérations plateforme sensibles.
- Interdire les tables applicatives `Session`, `OtpChallenge`, `UserIdentity` ou tout moteur de liaison maison.

Preuves : configuration Auth expurgée, prototype `X-01` à `X-06`, tests mêmes e-mails et matrice intention → contexte réel.

#### `S0-004` — Supabase Postgres, Data API et RLS — P0

- Définir les schémas `private`, `api`, `storage` et les objets nécessaires.
- Exposer explicitement seulement `api` à la Data API ; une nouvelle table n’est jamais réputée exposée par défaut.
- Définir grants minimaux, `FORCE ROW LEVEL SECURITY`, politiques par acteur et tests allow/deny.
- Prouver l’isolation inter-agences et intra-agence pour Locataire et Propriétaire.
- Utiliser le JWT utilisateur pour les appels initiés par l’utilisateur ; réserver `service_role` aux traitements techniques bornés.
- Prototyper les fonctions atomiques `SECURITY DEFINER` nécessaires avec propriétaire `NOLOGIN`, `search_path` fixe et contrôle d’autorisation interne.

Preuves : migrations jetables, tests pgTAP et revue des privilèges.

#### `S0-005` — Ledger et visibilité Propriétaire — P0

- Valider les formules du principal, commission Agence, net Propriétaire, commission plateforme et revenu net Agence.
- Stocker tous les montants XOF en entiers et tous les taux en points de base entre 0 et 10 000.
- Définir un ledger en partie double, immuable, équilibré et indépendant des frais FedaPay.
- Figurer propriétaire et taux sur chaque échéance/item.
- Modéliser `OwnerRentAvailability` et son historique append-only sans compte payable, balance de retrait ni objet de reversement.
- Définir le point mensuel : attendu, encaissé, en retard et net déclaré disponible, sans addition trompeuse.

Preuves : jeux d’exemples, propriétés comptables, tests de disponibilité manuelle et cas `AC-006`/`AC-015`.

#### `S0-006` — Topologie Supabase + Cloudflare — P0

- Valider React/Vite PWA servie par Cloudflare Workers et API Hono dans un Worker.
- Valider Supabase Auth/Postgres/Storage/Queues, Supabase CLI local et environnements distincts.
- Définir l’usage de Supabase Queues pour inbox/outbox, avec visibilité, acquittement, retry, DLQ et sweeper.
- Définir R2 privé comme journal de reprise indépendant pour les intentions de paiement avant appel FedaPay.
- Valider Cloudflare Browser Run pour le rendu PDF et Supabase Storage privé pour les reçus.
- Définir secrets, bindings, observabilité, régions, limites CPU/temps, coûts et responsabilité de chaque composant.
- Interdire Redis/BullMQ, D1, Fastify et un serveur Node permanent dans le périmètre Loya V1.

Preuves : manifestes Cloudflare/Supabase expurgés, configuration Queues/Storage/R2/Browser Run, diagramme de déploiement et POC Worker → Supabase/FedaPay.

#### `S0-007` — Prototype UX mobile-first — P1

- Prototyper `X-01` à `X-06`, dont les trois cartes d’entrée et le panneau Auth commun.
- Tester `L-01` à `L-05` à 320, 360 et 390 px selon leur ordre de blocs, palette, navigation, CTA et états obligatoires du DESIGN.
- Prototyper `A-12` : sélection de loyers payés, déclaration en lot, correction motivée et historique.
- Prototyper `O-01` à `O-04` : lecture seule, occupation, impayés, point mensuel, disponibilité datée et WhatsApp.
- Vérifier qu’aucun écran Propriétaire ne contient « Reversé », « Retiré », preuve de transfert ou solde à reverser.
- Vérifier WCAG 2.2 AA, zoom/reflow et une seule action principale par écran.

Preuves : captures, test clavier/lecteur d’écran et protocole de comparaison visuelle.

#### `S0-008` — Vie privée, APDP et exploitation — P0

- Cartographier responsables, sous-traitants, hébergement, transferts, rétention, suppression et droits des personnes.
- Documenter Supabase, Cloudflare, FedaPay, Google, fournisseur SMTP et push.
- Réduire la vue Propriétaire aux seules données nécessaires : bien, occupation, période, état, mode/date d’encaissement, commission, net et disponibilité déclarée.
- Exclure frais FedaPay, total débité, commission plateforme et coordonnées privées inutiles du Locataire.
- Définir contact WhatsApp, remboursements externes et correction des déclarations erronées.
- Valider conservation des reçus, audits, événements d’inbox/outbox et historique de disponibilité.

Preuves : registre, DPIA ou décision motivée, matrice de rétention et runbooks.

#### `S0-009` — SLO, sauvegarde et reprise — P0

- Chiffrer SLO, RPO et RTO par parcours.
- Configurer sauvegardes/PITR Supabase, rétention R2, sauvegarde de configuration Cloudflare et tests de restauration.
- Définir une enveloppe de reprise FedaPay authentifiée, chiffrée, versionnée et écrite en R2 avant l’appel fournisseur.
- Prouver qu’une transaction absente du point restauré peut être retrouvée par compte marchand/fenêtre puis réconciliée sans double effet.
- Définir reprise Supabase Queues, messages invisibles expirés, DLQ, métriques et alertes.
- Vérifier qu’une restauration ne reconstruit jamais automatiquement une disponibilité Propriétaire depuis FedaPay : seules les déclarations restaurées ou rejouées depuis leur historique métier font foi.

Preuves : configuration de sauvegarde et de rétention, test de restauration chronométré, rapport RPO/RTO et runbook de réconciliation.

### 3.3 Porte de sortie `GATE-0`

- [ ] Le PRD, le STI, le DESIGN et la ROADMAP courants, ainsi que leur matrice, passent sans référence orpheline.
- [ ] Le contrat FedaPay prouve signature, idempotence, devis, relecture et double charge.
- [ ] Supabase Auth prouve Google + OTP e-mail, même `auth.users.id`, SMTP de production, trois intentions sans privilège et MFA plateforme.
- [ ] Data API, grants, RLS, JWT utilisateur et fonctions privilégiées minimales sont prouvés.
- [ ] La topologie Cloudflare Workers + Supabase, Queues, Storage, R2 et Browser Run est validée.
- [ ] Ledger, commissions et disponibilité déclarative passent les exemples ; aucun modèle de reversement Propriétaire n’existe.
- [ ] Les prototypes `X-01` à `X-06`, `L-01` à `L-05`, `A-12` et `O-01` à `O-04` sont validés.
- [ ] APDP, rétention, SLO, RPO/RTO et restauration testée possèdent une décision signée.

## 4. Sprint 1 — Fondation sécurisée

### 4.1 Objectif

Livrer un squelette déployable avec Auth Supabase, multi-agence, autorisations, audit et traitement asynchrone durables. Aucun flux financier réel n’est activé.

### 4.2 Tâches

#### `S1-001` — Monorepo et qualité — P0

- Créer exactement les workspaces canoniques du STI : `apps/web`, `apps/worker`, puis `packages/core`, `packages/schemas`, `packages/auth`, `packages/db`, `packages/ui`, `packages/payments`, `packages/recovery`, `packages/storage`, `packages/notifications`, `packages/config` et `packages/observability`.
- Initialiser React/Vite/TypeScript strict, Hono sur Cloudflare Workers, ESLint, Prettier et Vitest.
- Configurer commits conventionnels, hooks rapides, Changesets si utile et politique de dépendances.
- Ajouter CI GitHub : lint, types, tests, build, migrations locales, tests RLS, scan secrets/SCA et artefacts.
- Protéger `main`, exiger PR, revues CODEOWNERS, checks verts et squash/rebase documenté.

Preuves : versions d’outillage épinglées, dépôt propre, CI verte, preview Cloudflare et guide contributeur.

#### `S1-002` — Environnements et configuration — P0

- Séparer local, preview, test, staging et production.
- Configurer projets Supabase, migrations, seed non sensible et types générés.
- Configurer Workers, domaines, bindings, R2, secrets et observabilité par environnement.
- Configurer Google Auth, SMTP et redirections Supabase propres à chaque environnement.
- Classer les variables : publiques navigateur, serveur Worker et secrets d’exploitation.
- Interdire toute clé `service_role`, secret FedaPay ou secret SMTP dans le bundle web, les logs ou Git.

Preuves : matrice d’environnements, déploiement preview et scan de bundle/secrets.

#### `S1-003` — Schéma identité métier et Agence — P0

- Laisser Supabase gérer `auth.users`, sessions, identités OAuth et OTP.
- Créer uniquement les tables métier : `Profile`, `PlatformMembership`, `PlatformOperatorElevation`, `Agency`, `AgencySettings`, `AgencyOnboardingState`, `AgencyPaymentAccount`, `Membership`, `TenantProfile`, `Owner`, `OwnerUserAccess`, `Invitation`, préférences et abonnements push.
- Utiliser `auth.users.id` comme clé canonique nullable jusqu’à acceptation lorsqu’approprié.
- Contraindre invitations : hash unique, destinataire normalisé, cible XOR, expiration, consommation unique et cohérence des états.
- Garantir un accès Propriétaire actif unique par cible et au moins un ADMIN actif par Agence.
- Rendre le bootstrap de la première Agence atomique et explicite après validation de l’onboarding, jamais au callback Google.

Preuves : migrations up/down, contraintes concurrentes et diagramme relationnel.

#### `S1-004` — RLS, vues API et transactions — P0

- Placer tables sensibles dans `private` et projections utilisateur dans `api`.
- Utiliser des vues `security_invoker` et exposer explicitement le seul schéma `api` à la Data API.
- Activer `FORCE ROW LEVEL SECURITY`, révoquer les grants implicites et accorder uniquement les lectures nécessaires au rôle `authenticated`.
- Exécuter les mutations via fonctions transactionnelles ou Worker avec JWT utilisateur et contrôle du contexte.
- Isoler Agence, Locataire, Propriétaire et plateforme ; tester également deux acteurs du même type dans une Agence.
- Encadrer `service_role` : aucune requête d’utilisateur ne doit devenir omnipotente par commodité.

Preuves : tests pgTAP allow/deny, matrice des grants et revue SQL.

#### `S1-005` — Authentification Supabase et contextes — P0

- Implémenter `X-01` avec trois cartes Agence/Locataire/Propriétaire.
- Implémenter le panneau commun : « Continuer avec Google » puis OTP e-mail visible.
- Conserver l’intention dans une valeur signée/éphémère côté serveur ; elle ne constitue jamais une permission.
- Après Auth, résoudre rattachements et invitations réels ; ouvrir le contexte unique, proposer les contextes autorisés ou l’état d’attente.
- Préserver une invitation valide à travers redirection Google, annulation et reprise OTP.
- Implémenter changement de contexte et fermeture de session via Supabase.
- Implémenter `/platform/sign-in` sans quatrième carte publique : Auth Supabase, résolution de `PlatformMembership`, puis `X-06`/JWT `aal2` obligatoire avant tout écran Plateforme ; fraîcheur TOTP reverifiée pour les mutations sensibles.
- Imposer TOTP `aal2` sur `X-06` pour Super Admin et mutations plateforme sensibles.

Preuves : E2E Google/OTP, même `auth.users.id`, intention falsifiée refusée, MFA et tests d’accessibilité.

#### `S1-006` — Invitations et rattachements — P0

- Créer, renvoyer, révoquer, prévisualiser et accepter les invitations membre/Locataire/Propriétaire.
- Ne jamais accepter une invitation par la seule réussite de Google : exiger l’action explicite sur la cible vérifiée.
- Consommer atomiquement le jeton et créer exactement le rattachement ciblé.
- Conserver l’aperçu si mauvais compte, preuve expirée ou Agence suspendue, sans fuite de données.
- Autoriser ADMIN/GESTIONNAIRE selon la matrice PRD et protéger la dernière appartenance ADMIN.
- Tester les courses acceptation/révocation/expiration et deux invitations convergentes.

Preuves : tests E2E et propriétés de concurrence.

#### `S1-007` — Permissions plateforme et audit — P0

- Implémenter les rôles Agence ADMIN/GESTIONNAIRE/COMPTABLE/LECTEUR.
- Implémenter `PlatformMembership` et élévation opérateur distinctes des appartenances Agence.
- Exiger `aal2`, motif et TTL pour une élévation exceptionnelle ; l’accès normal Super Admin reste limité aux vues plateforme.
- Journaliser action, acteur, contexte, cible, avant/après minimal, motif, corrélation et horodatage serveur.
- Interdire les mutations directes de rôle et les élévations persistantes.
- Créer des tests de permissions exhaustifs, notamment disponibilité Propriétaire réservée à ADMIN/COMPTABLE.

Preuves : matrice exécutable, journal d’audit et tests du dernier ADMIN.

#### `S1-008` — Inbox, outbox et Supabase Queues — P0

- Créer tables inbox/outbox et files Supabase Queues nécessaires.
- Dans une même transaction, enregistrer l’état durable puis publier le message `pgmq.send`.
- Définir consommateurs Worker, visibilité, lease, acquittement après commit, retry exponentiel et DLQ.
- Définir sweeper des lignes durables sans message et des messages bloqués/expirés.
- Garantir une clé idempotente par effet métier et un identifiant de corrélation bout en bout.
- Exposer métriques backlog, âge, retries, DLQ et divergence table/file.

Preuves : tests crash avant/après `send`, double livraison, lease expirée et runbook.

#### `S1-009` — Shells applicatifs — P1

- Livrer les shells communs `X-01` à `X-06`, centre de notifications et changement de contexte.
- Livrer navigation Locataire Loya, navigation Agence responsive, navigation Propriétaire en lecture seule et Super Admin.
- Ajouter gardes de route fondées sur les rattachements réels, jamais sur la carte d’entrée choisie.
- Couvrir vide, chargement, erreur, hors-ligne prudent, session expirée et accès révoqué.
- Installer les tokens visuels et composants accessibles partagés sans effacer la hiérarchie propre à chaque contexte.

Preuves : Storybook ou catalogue équivalent, captures 320/360/390/1024/1440 et E2E de navigation.

### 4.3 Tests obligatoires

- Google, OTP e-mail, même adresse vérifiée, annulation Google, OTP expiré/limité et SMTP indisponible.
- Porte falsifiée, utilisateur sans accès, multi-rôles, invitation en cours et changement de contexte.
- Invitation concurrente, suspendue, expirée, révoquée, mauvais compte et dernier ADMIN.
- RLS inter-agences et intra-agence pour tous les acteurs ; accès plateforme borné.
- Mutation avec JWT d’une autre Agence, `service_role` absent du navigateur et Data API non exposée par défaut.
- Crash inbox/outbox/queue, double livraison, retry, DLQ et sweeper.
- Clavier, lecteur d’écran, zoom et connectivité faible pour `X-01` à `X-06`.

### 4.4 Porte de sortie `GATE-1`

- [ ] Monorepo, CI, preview et migrations sont reproductibles.
- [ ] Auth Supabase Google/OTP, SMTP, trois portes et MFA passent les E2E.
- [ ] Aucun schéma maison de session/OTP/identité n’existe.
- [ ] Invitations, rattachements, multi-contextes et dernier ADMIN sont atomiques.
- [ ] Data API, grants et RLS passent la matrice allow/deny.
- [ ] Inbox/outbox/Supabase Queues survivent aux crashs et doubles livraisons.
- [ ] Les shells sont accessibles, responsive et ne donnent aucun droit implicite.

## 5. Sprint 2 — Référentiels et échéances

### 5.1 Objectif

Créer manuellement une chaîne Agence → Propriétaire → Bien → Unité → Profil locataire → Affectation → Échéance, avec calendriers et taux reproductibles.

### 5.2 Tâches

#### `S2-001` — Paramètres Agence — P1

- Après identité Google ou OTP e-mail, exécuter les six étapes `A-01` sans considérer les données Google comme preuve d’entreprise ou de représentant légal.
- À la validation explicite de l’étape 1, créer idempotemment et atomiquement `Agency(DRAFT)` + paramètres initiaux + `Membership(ADMIN)` ; l’ouverture de l’écran et les callbacks d’authentification n’appellent jamais ce bootstrap.
- Persister `AgencyOnboardingState` à chaque étape avec version optimiste ; reprendre le même brouillon et la dernière étape après fermeture/reconnexion. Autoriser la correction d’une étape antérieure, recalculer/invalider ses dépendances et empêcher tout saut ou écrasement de version.
- Implémenter la matrice normative des six étapes : champs fermés, validations, tables cibles, hashes de rejeu, `last_completed_step` contigu et dépendances invalidées.
- Numéro WhatsApp obligatoire avant activation.
- Politique d’échéance : jour 1–31, dernier jour de mois, grâce, rappels et horizon futur.
- Modes manuels et politique référence/preuve.
- Règle de disponibilité Propriétaire : seuls ADMIN et COMPTABLE pourront déclarer un loyer payé disponible auprès de l’Agence ; aucun paramètre de reversement n’est créé.
- Appliquer les gardes : `DRAFT` = onboarding seul, `ACTIVE` = référentiels/paiements manuels selon permissions, `SUSPENDED` = consultation ; activation Agence indépendante de FedaPay.
- Étape FedaPay « Configurer maintenant / Plus tard » : l'Agence peut être activée dans les deux cas ; depuis `DRAFT`, le start reste inaccessible avant quatre étapes contiguës revalidées, puis crée/reprend idempotemment `AgencyPaymentAccount(PENDING)` avec une `provider_application_reference` stable et persiste `KYB_ONBOARDING_REQUESTED` dans l'outbox avant tout appel fournisseur. Depuis `ACTIVE`, il reste disponible après « Plus tard ».
- Dispatcher KYB avec fast-path post-commit et worker : même clé fournisseur au rejeu, lookup par `provider_application_reference` après timeout ou réponse perdue, reprise après crash avant/après appel et interdiction de créer une seconde application pour la même version.
- Capacité FedaPay séparée et en lecture seule « Non commencée / En validation / Prête / Bloquée », dérivée exclusivement du compte courant non retiré ; implémenter absence→`PENDING`, callbacks/lookups signés, transitions versionnées `READY/BLOCKED/RETIRED`, resoumission par nouvelle version et commande opérateur avec preuve. Google et les rôles Agence ne peuvent jamais fournir le statut et l’encaissement en ligne reste désactivé avant « Prête ».
- Parcours `A-01` responsive.

#### `S2-002` — Référentiels manuels — P1

- Propriétaires, biens, unités et profils locataires.
- Images de couverture facultatives des biens/unités, stockage privé, variantes responsives et fallback Loya sobre.
- Recherche, filtres, statuts et formulaires.
- Cartes mobile, tables desktop.
- **Aucun import** et aucun artefact d’import dormant.

#### `S2-003` — Politiques de commission — P0

- Taux Agence par défaut et remplacement spécifique par propriétaire.
- Politique plateforme versionnée, défaut 100 bps.
- Endpoints stricts GET/POST des politiques : `commission_policy.manage` pour l’ADMIN Agence ; contexte/permission plateforme et réauthentification pour le Super Admin ; aucun rôle Agence ne modifie le taux plateforme.
- Dates d’effet, résolution par date d’échéance, prévention des chevauchements et historique.
- Bornes 0–10 000 bps incluses en UI, domaine et base.
- Alerte sans blocage lorsque le net Agence calculé est négatif ; le montant Propriétaire reste intact.
- Écran `A-11` et base de `S-02`.

#### `S2-004` — Affectations — P0

- Une affectation active par unité.
- Montant XOF, dates, politique et taux effectifs.
- Première échéance explicitement entière.
- Changements futurs seulement.
- Cycle de vie `ACTIVE`/`ENDED` : aucune nouvelle échéance après fin, sans altérer celles déjà émises.
- Snapshot du propriétaire bénéficiaire et des taux lors de chaque émission.
- Parcours `A-07` et tests de concurrence.

#### `S2-005` — Génération d’échéances — P0

- Générateur mensuel idempotent.
- Snapshots immuables du propriétaire, des taux et politiques résolus à la date d’échéance.
- `PENDING`, `OVERDUE`, `CANCELLED` selon transitions autorisées.
- Horizon de mois futurs pour paiement anticipé.
- Aucun état partiel.

#### `S2-006` — Relances et notifications initiales — P1

- `INVOICE_CREATED`, rappel et retard via outbox.
- Déduplication, plafonds et préférences autorisées.
- Centre in-app initial et badge non lu.

#### `S2-007` — Vues métier de base — P1

- `A-03` à `A-08`, `L-01` à `L-03` en lecture, `O-01` et `O-02` en lecture.
- Projections `TenantPortfolioSummaryDTO`, `TenantRentalDTO` et endpoints portefeuille Loya, fan-out RLS par Agence et images signées courtes.
- Projections Propriétaire de base : biens autorisés, occupation datée, échéances attendues/payées/en retard et données Locataire strictement nécessaires.
- Préparer `A-12` en lecture avec les loyers `PAID` à l’état `TO_CONFIRM`, sans mutation avant le Sprint 3.
- Recherche et filtres serveur.
- États vides, hors ligne et accès refusé.

### 5.3 Tests de sprint

- Onboarding Agence : brouillon/ADMIN uniques sous concurrence, sauvegarde/version par étape, reprise après reconnexion, correction avec dépendances recalculées, WhatsApp obligatoire et activation indépendante de la capacité FedaPay.
- États Agence/capacité : gardes `DRAFT/ACTIVE/SUSPENDED`, paiement manuel autorisé en `ACTIVE` avant `READY`, choix FedaPay maintenant/plus tard, start refusé avant étapes 1–4 valides puis idempotent et committé avant appel, crash/timeout/réponse perdue repris par la même référence sans double application, callback/lookup/opérateur versionnés, resoumission, projection exacte et impossible à écrire par un rôle Agence.
- Jour 28–31 sur année normale et bissextile.
- Grâce sans modification du montant.
- Unicité échéance et affectation sous concurrence.
- Taux défaut/remplacement spécifique/date d’effet résolus par date d’échéance, y compris net Agence négatif avec alertes.
- Routes de taux : GESTIONNAIRE/COMPTABLE/LECTEUR refusés côté Agence, tous les rôles Agence refusés côté plateforme, Super Admin sans réauthentification refusé.
- Taux 0 et 10 000 bps acceptés ; -1 et 10 001 refusés en UI, API et base.
- Changement de propriétaire ou fin d’affectation : historique immuable et aucune nouvelle émission indue.
- Première échéance personnalisée mais indivisible.
- Génération répétée sans doublon.
- Invitation non acceptée : profil reçoit des échéances, aucun accès utilisateur.
- Portefeuille Loya multi-agence sans fuite, cartes logement avec/sans image et action `+` limitée à l’invitation.
- RLS sur toutes les nouvelles tables.
- Aucun bouton ou route d’import.

### 5.4 Porte de sortie `GATE-2`

- [ ] La chaîne métier complète peut être créée sans import.
- [ ] Les échéances futures et retards sont déterministes.
- [ ] Les taux historiques et futurs sont reproductibles.
- [ ] Les deux taux respectent les bornes 0–10 000 bps à toutes les couches.
- [ ] Une seule affectation active et une seule échéance par période sont garanties en base.
- [ ] Les parcours de base fonctionnent à 320–1440 px.

## 6. Sprint 3 — Paiements, ledger et notifications

### 6.1 Objectif

Livrer en sandbox et en test le cycle échéance entière → paiement → confirmation → ledger → reçu → disponibilité à confirmer → éventuelle déclaration manuelle Agence → notifications, ainsi que les paiements manuels et corrections externes. Aucun mouvement de fonds vers le Propriétaire n’est géré.

### 6.2 Tâches

#### `S3-001` — Core financier et ledger — P0

- Implémenter les types XOF entiers, points de base, périodes et fuseaux.
- Produire les écritures équilibrées par item pour le principal analytique, la commission Agence brute, le net Propriétaire et la commission plateforme. `agencyNetRevenueXof = agencyCommissionGrossXof - platformCommissionXof` reste une projection dérivée sans écriture propre afin d’éviter toute double comptabilisation.
- Conserver les snapshots de propriétaire, taux et politique.
- Interdire UPDATE/DELETE du ledger en base ; toute correction est une extourne liée.
- Tester invariants, bornes et revenu net Agence négatif sans réduction du net Propriétaire.

Preuves : tests de propriété, contraintes SQL et rapport d’équilibrage.

#### `S3-002` — PaymentOrder multi-échéances — P0

- Sélectionner des échéances entières, consécutives par affectation et dans une seule Agence/compte marchand.
- Autoriser plusieurs mois d’avance et plusieurs logements de la même Agence.
- Verrouiller/réserver sans double ordre actif ; expirer et libérer de façon idempotente.
- Calculer principal, devis de frais FedaPay et total débité uniquement pour le DTO Locataire.
- Versionner devis, compte marchand, canal, taux/snapshots et idempotence client.
- Revalider disponibilité des échéances et devis au CTA final.

Preuves : `AC-001`, `AC-002`, `AC-003`, `AC-013` et tests de concurrence.

#### `S3-003` — Adaptateur FedaPay sandbox — P0

- Créer l’interface fournisseur côté Worker, jamais dans le navigateur.
- Écrire et acquitter l’enveloppe de reprise R2 avant l’appel de création.
- Déclencher la tentative via outbox/Supabase Queue avec clé fournisseur stable.
- Après timeout, rechercher par `merchantReference` avant tout nouvel appel.
- Utiliser checkout/carte hébergée et ne jamais manipuler de donnée carte.
- Journaliser uniquement les références nécessaires, sans secrets ni payload sensible.

Preuves : sandbox, charge unique sous concurrence, timeout récupéré et envelope R2 validée.

#### `S3-004` — Webhook Cloudflare Worker et inbox — P0

- Exposer le webhook Hono sur Cloudflare Worker et lire le corps brut une seule fois.
- Vérifier signature, horodatage et anti-rejeu avant toute mutation.
- Enregistrer durablement l’événement dans l’inbox et publier sa référence dans Supabase Queues au sein de la même transaction.
- Retourner rapidement `2xx` après durabilité ; le traitement métier reste asynchrone.
- Dédupliquer avec les identifiants fournisseur, jamais avec un header `Idempotency-Key` entrant.
- Conserver payload chiffré/minimisé selon rétention et observabilité.

Preuves : signature invalide, événement répété/désordonné, crash et latence d’acquittement.

#### `S3-005` — Worker de confirmation — P0

- Consommer l’inbox via Supabase Queue et verrouiller l’objet métier.
- Interpréter les états FedaPay au moyen d’un mapping versionné.
- Confirmer une charge une seule fois, créer paiement/items/ledger et passer chaque disponibilité Propriétaire à `TO_CONFIRM` dans la même transaction.
- Mettre l’échéance `PAID` dès l’approbation FedaPay, indépendamment de la balance fournisseur.
- Créer outbox pour reçu, notifications et projections ; acquitter la Queue seulement après commit.
- Traiter événements tardifs, désordonnés, double charge et reprise après crash.

Preuves : `AC-005`, crash avant/après commit, double livraison et convergence.

#### `S3-006` — Paiements manuels — P0

- Autoriser uniquement ADMIN et COMPTABLE ; GESTIONNAIRE et LECTEUR n’obtiennent ni CTA ni mutation.
- Exiger échéances entières, mode, date, référence/preuve selon politique et idempotence.
- Valider en une transaction paiement/items/ledger/`TO_CONFIRM`/reçu/outbox.
- Empêcher conflit avec réservation ou paiement FedaPay concurrent.
- Afficher distinctement le mode manuel sans frais FedaPay.

Preuves : `AC-004`, conflits concurrents, permissions et audit.

#### `S3-007` — Reçus privés — P1

- Générer le reçu Locataire FedaPay avec principal, frais et total débité.
- Générer le reçu manuel sans frais fournisseur.
- Générer les vues/reçus internes Agence sans frais FedaPay.
- Rendre les PDF via Cloudflare Browser Run à partir d’un template versionné.
- Stocker dans Supabase Storage privé et servir par URL signée courte après contrôle d’accès.
- Rendre tout reçu confirmé immuable ; une correction produit un document lié.

Preuves : tests par audience, hash du document et accès inter-acteurs refusé.

#### `S3-008` — Commissions plateforme — P0

- Créer accruals append-only par échéance confirmée et correction négative liée.
- Émettre l’événement `PLATFORM_STATEMENT_ISSUED`, puis gérer les relevés Agence immuables selon les seuls états canoniques `DUE`, `OVERDUE`, `PAID`, `CREDIT` ou `CANCELLED` ; `ISSUED` n’est jamais un état.
- Reporter un crédit résiduel sans règlement externe.
- Enregistrer un règlement exact du relevé une seule fois par Super Admin réauthentifié.
- Ne jamais exposer commission plateforme au Locataire ou Propriétaire.

Preuves : `AC-012`, relevés nuls/créditeurs et permissions.

#### `S3-009` — Disponibilités Propriétaires — P0

- Créer `OwnerRentAvailability` et `OwnerRentAvailabilityEvent` immuable pour chaque item `PAID`.
- État initial `TO_CONFIRM` créé avec le paiement, sans lecture de balance FedaPay.
- Exposer à ADMIN/COMPTABLE une commande individuelle et en lot vers `AVAILABLE_WITH_AGENCY`.
- Valider la liste exacte, une seule Agence, uniquement des items payés, et appliquer le lot atomiquement avec clé d’idempotence.
- Conserver date serveur, acteur, items et événement d’audit ; un rejeu ne duplique rien.
- Autoriser la correction vers `TO_CONFIRM` avec motif obligatoire et historique append-only.
- Retirer la disponibilité courante des projections lors d’un remboursement intégral du paiement valide, sans effacer l’historique.
- Ne créer ni transfert, bénéficiaire de retrait, solde, statut « reversé/retiré/reçu » ni preuve de remise.

Preuves : `AC-015`, batch tout-ou-rien, rejeu, correction, remboursement et tests RLS.

#### `S3-010` — Remboursement externe et anomalies — P0

- Enregistrer uniquement un remboursement intégral déjà exécuté hors Loya, avec preuve et audit.
- Extourner ledger/commissions, rouvrir atomiquement les échéances et invalider leur disponibilité courante.
- Distinguer remboursement du paiement valide et correction d’une double charge.
- Pour une double charge remboursée, conserver paiement, échéances, ledger et disponibilité du paiement valide.
- Interdire toute commande de remboursement FedaPay depuis Loya.

Preuves : `AC-007`, `AC-011` et scénarios multi-mois atomiques.

#### `S3-011` — Notifications transactionnelles — P1

- Implémenter la matrice événement × destinataire × projection × lien profond.
- Couvrir invitation, échéance, retard, paiement, reçu, remboursement externe, disponibilité déclarée/corrigée, relevé plateforme et capacité KYB.
- Pour le Propriétaire, mentionner la date et le caractère déclaratif ; ne jamais annoncer un transfert ou retrait.
- Garder les aperçus push/e-mail génériques ; le détail reste dans le centre authentifié.
- Dédupliquer par effet, respecter préférences, révoquer abonnements invalides et tester le cycle web push.
- Résoudre le contact WhatsApp depuis la ressource autorisée côté serveur.

Preuves : tests par audience, doublons, révocation et confidentialité.

#### `S3-012` — Rapprochement et supervision — P0

- Rapprocher ordres, charges, événements, paiements, ledger, reçus et outbox.
- Relire FedaPay par compte marchand/fenêtre lors des anomalies et après restauration.
- Détecter charge sans ordre, ordre sans charge, double charge, ledger déséquilibré, reçu absent et message bloqué.
- Superviser les disponibilités orphelines ou incohérentes uniquement par rapport au paiement local, jamais à la balance FedaPay.
- Fournir commandes de réconciliation idempotentes, alertes et runbooks sans mutation manuelle directe de tables.

Preuves : injections de panne, tableau de bord opérationnel et résolution auditée.

### 6.3 Scénarios critiques de sprint

- Un mois FedaPay, plusieurs mois d’avance et plusieurs logements de la même Agence.
- Sélection inter-agences scindée ; aucune charge unique inter-agences.
- Deux ordres concurrents, deux clés client et lease expirée pendant appel lent : une charge au plus par génération.
- Webhook répété, invalide, tardif, désordonné et crash du consumer.
- Paiement manuel concurrent avec tentative FedaPay.
- Principal exact côté Agence ; frais et total seulement côté Locataire.
- Reçu privé par audience et URL expirée.
- Relevé plateforme crédit/nul/positif et correction append-only.
- Paiement confirmé → `TO_CONFIRM` sans dépendre de FedaPay.
- Déclaration unitaire/en lot ADMIN ou COMPTABLE, rejeu sans effet, correction motivée et rôle refusé.
- Remboursement valide retire la disponibilité courante ; remboursement d’une double charge ne la modifie pas.
- Le Propriétaire voit la date et WhatsApp, jamais un reversement, retrait, preuve ou solde restant.
- Restauration sans ordre local, relecture fournisseur et effet unique après reconstruction R2.

### 6.4 Porte de sortie `GATE-3`

- [ ] Ledger équilibré, immutable et reproductible.
- [ ] Paiements FedaPay et manuels confirment exactement les échéances entières.
- [ ] Webhook Worker/inbox/Queue/consumer résiste aux doublons, désordre et crash.
- [ ] Reçus privés et DTO par audience ne fuient aucun frais.
- [ ] Disponibilité `TO_CONFIRM`/ `AVAILABLE_WITH_AGENCY` est manuelle, atomique, auditée et indépendante de FedaPay.
- [ ] Aucun endpoint, écran, table ou notification de remise de fonds Propriétaire n’existe.
- [ ] Remboursements externes et double charge convergent correctement.
- [ ] Rapprochement, alertes et runbooks sont exécutables.

## 7. Sprint 4 — Espaces complets, responsive et accessibilité

### 7.1 Objectif

Finaliser les quatre contextes sur le socle validé, avec fidélité Loya côté Locataire, densité adaptée côté Agence, lecture seule côté Propriétaire et contrôle renforcé côté Super Admin.

### 7.2 Tâches

#### `S4-001` — Espace Locataire — P1

- Finaliser `L-01` à `L-08`, `N-01`, `N-02` et accès commun.
- Respecter les règles Loya du DESIGN : fond `#fcfcfc`, bleu nuit, accent doré minimal, hiérarchie, navigation à quatre entrées, ordre des blocs et CTA obligatoires.
- Dashboard, logements, détail, sélection multi-mois/multi-logements même Agence, récapitulatif, traitement, paiements, reçus et aide.
- Afficher frais/total seulement avant confirmation et sur reçu FedaPay.
- Résoudre WhatsApp depuis le logement/paiement/Agence autorisé.
- Couvrir toutes erreurs, devis expiré, paiement en cours, reprise, vide et hors-ligne sans fausse confirmation.

Preuves : E2E `AC-001` à `AC-003`, `AC-009`, `AC-010`, `AC-013`, captures 320/360/390 px et comparaison visuelle.

#### `S4-002` — Espace Agence — P1

- Finaliser `A-01` à `A-17`.
- Dashboard : dus, retards, payés, paiements récents, nets Propriétaires calculés et disponibilités à confirmer.
- Référentiels, affectations, échéances, paiements manuels, paiements, commissions, relevés plateforme et notifications.
- `A-12` : filtres, sélection unitaire/en lot, déclaration, confirmation, correction motivée et historique.
- Montrer clairement que l’action déclare une information ; elle ne transfère aucune somme.
- Respecter permissions, gardes DRAFT/ACTIVE/SUSPENDED et capacité FedaPay distincte.

Preuves : E2E par rôle, `AC-004`, `AC-006`, `AC-015` et captures mobile/tablette/desktop.

#### `S4-003` — Espace Propriétaire — P1

- Finaliser `O-01` à `O-04` en lecture seule.
- Borner chaque contexte à une seule Agence ; tout changement d’Agence passe par `X-04` et purge l’ancien contexte.
- Afficher biens autorisés, Loué/Vacant, échéances à venir/payées/en retard et locataires avec loyer en retard.
- Séparer point mensuel : principal/net attendus, principal/commission/net encaissés, retard et net déclaré disponible.
- Afficher par loyer `TO_CONFIRM` ou « Disponibilité déclarée par l’Agence le {date} ».
- Ajouter WhatsApp contextualisé vers l’Agence et avertissement que l’information est déclarative.
- N’afficher ni frais FedaPay, commission plateforme, CSV, transfert, retrait, preuve, reçu de remise ou solde à reverser.

Preuves : E2E invitation et RLS, `AC-015`, tests de confidentialité et captures 320–1440 px.

#### `S4-004` — Espace Super Admin — P1

- Finaliser `S-01` à `S-06`, `X-06` et vues techniques nécessaires.
- Rendre la route opérateur non référencée accessible uniquement après Auth Supabase, `PlatformMembership` et `X-06`/JWT `aal2`, sans quatrième porte sur `X-01`.
- Gérer Agences, suspension/réactivation, taux plateforme, relevés et règlements de relevés.
- Exiger TOTP `aal2`, réauthentification, permissions plateforme et motif pour actions sensibles.
- Afficher anomalies techniques/financières sans exposer une balance FedaPay ou des données Locataire inutiles.
- Ne donner aucun accès général implicite aux données métier.

Preuves : E2E MFA, permissions/élévation et audit.

#### `S4-005` — Responsive systématique — P0

- Tester 320, 360, 390, 768, 1024 et 1440 px, orientations utiles et zoom 400 %.
- Transformer tables en cartes ou reflow lisible sans masquer les montants essentiels.
- Conserver une seule action principale et éviter tout défilement horizontal sur parcours communs.
- Tester clavier mobile, zones sûres, navigation basse Locataire/Propriétaire et sidebar Agence/Super Admin.
- Vérifier les dialogues de lots et tableaux financiers aux faibles largeurs.

Preuves : matrice de captures et tests Playwright.

#### `S4-006` — Accessibilité — P0

- Auditer WCAG 2.2 AA : structure, noms accessibles, contraste, focus, clavier, lecteur d’écran, erreurs, annonces live et mouvement réduit.
- Garantir cibles 44 × 44 px, texte mobile ≥ 16 px et zoom autorisé.
- Rendre statuts compréhensibles sans couleur seule.
- Tester Auth, paiement, déclaration en lot et point mensuel avec technologies d’assistance.

Preuves : axe automatisé, audit manuel et liste d’écarts close.

#### `S4-007` — Performance mobile — P1

- Mesurer Core Web Vitals, poids initial, latence Worker/Supabase et requêtes critiques.
- Paginer agrégats, éviter N+1, optimiser indexes et limiter URLs signées.
- Compresser images et charger les routes lourdes à la demande.
- Tester réseau lent, cold start et gros portefeuille multi-agence.
- Respecter les budgets fixés au Sprint 0.

Preuves : rapport p75/p95 et profils avant/après.

#### `S4-008` — Exports et fichiers — P1

- Export CSV/Excel réservé à l’Agence selon permissions.
- Autoriser uniquement les colonnes métier Agence, sans frais FedaPay ni total débité.
- Servir reçus et images privés après contrôle d’accès avec expiration courte.
- Interdire CSV Propriétaire et tout fichier assimilable à une preuve de remise de fonds.
- Tester injection CSV, fuite par URL, cache et accès révoqué.

Preuves : tests positifs/négatifs par rôle et inventaire des colonnes.

#### `S4-009` — QA contenu et anti-périmètre — P0

- Scanner UI, routes, schéma, code et tests contre les fonctions exclues.
- Vérifier les libellés exacts Loya et le vocabulaire « loyer en retard/impayé », jamais « insolvable ».
- Vérifier « Disponibilité déclarée par l’Agence le {date} » et son avertissement informatif.
- Rejeter tout terme ou objet présentant un retrait/remise de fonds Propriétaire comme géré par Loya.
- Vérifier que les trois portes ne deviennent jamais des rôles.
- Supprimer code dormant, flags et dépendances hors périmètre.

Preuves : rapport automatisé, revue produit/UX et inventaire final.

### 7.3 Porte de sortie `GATE-4`

- [ ] Les 43 écrans du DESIGN sont reliés à une tâche et un test.
- [ ] `L-01` à `L-05` respectent leur ordre de blocs, leur palette, leur navigation, leurs CTA et leurs états obligatoires.
- [ ] Les trois portes utilisent le même Auth Supabase et n’accordent aucun droit.
- [ ] `A-12` permet déclaration/correction manuelle sans mouvement de fonds.
- [ ] `O-01` à `O-04` sont strictement en lecture seule et séparant toutes les métriques.
- [ ] Responsive, accessibilité et performance respectent les budgets.
- [ ] Exports et fichiers ne fuient aucune donnée interdite.
- [ ] Le scan anti-périmètre est sans écart.

## 8. Sprint 5 — Pilote et durcissement

### 8.1 Objectif

Prouver sécurité, résilience, restauration, exploitation et compréhension métier avant un pilote limité. Aucun trafic réel ne s’ouvre si une porte P0 reste rouge.

### 8.2 Tâches

#### `S5-001` — Sécurité et confidentialité — P0

- Revue menaces Auth Supabase, invitations, RLS, Worker, FedaPay, Storage, Queues, R2 et Browser Run.
- Vérifier URL de redirection, SMTP, MFA, durée de session et politiques de mot de passe désactivées pour le parcours V1.
- Auditer grants Data API, `FORCE RLS`, fonctions `SECURITY DEFINER`, `search_path` et séparation `service_role`.
- Tester IDOR, élévation de rôle, contexte falsifié, invitation volée, webhook forgé et fuite de fichier.
- Scanner secrets, dépendances, bundle, logs et artefacts.
- Vérifier minimisation Propriétaire et conformité APDP.

Preuves : rapport de sécurité sans P0/P1 ouvert et plan d’incident.

#### `S5-002` — Charge et résilience — P0

- Tester charge Web/Worker/Supabase aux volumes pilotes et pics de paiement.
- Simuler panne Google, SMTP, FedaPay, Supabase, Storage, Queues, R2, Browser Run, push et Cloudflare.
- Prouver backpressure, timeouts, retries bornés, circuit breaker approprié et DLQ.
- Prouver qu’aucune mutation financière n’est mise hors ligne dans le navigateur.
- Vérifier dégradation sûre : aucune fausse confirmation ni fausse disponibilité.

Preuves : rapport de charge, SLO mesurés et runbooks exécutés.

#### `S5-003` — Sauvegarde et restauration — P0

- Restaurer Supabase à un point choisi et réappliquer migrations/configuration.
- Rejouer/reconcilier les intentions FedaPay depuis R2 et relecture par compte marchand/fenêtre.
- Reprendre inbox/outbox/Queues sans double effet et régénérer les projections nécessaires.
- Vérifier Storage, reçus, historique d’audit et événements de disponibilité.
- Prouver que les états Propriétaire restaurés proviennent de leurs événements métier, jamais d’une inférence FedaPay.
- Mesurer RPO/RTO et bloquer si les seuils ne sont pas respectés.

Preuves : exercice chronométré signé et écarts corrigés.

#### `S5-004` — Préparation production FedaPay — P0

- Valider comptes marchands/KYB, secrets, webhooks, redirections, clés d’idempotence et limites.
- Exécuter le parcours réel à faible montant autorisé puis rapprochement.
- Vérifier frais Locataire, principal Agence, reçu et notifications par audience.
- Confirmer opérationnellement que l’approbation vaut « Loyer payé » sans suivi de balance.
- Confirmer que la déclaration de disponibilité reste une action Agence distincte.
- Tester double charge et remboursement externe avec runbook.

Preuves : checklist FedaPay signée et preuve de bout en bout expurgée.

#### `S5-005` — Configuration pilote — P0

- Configurer projet Supabase production, Auth Google, SMTP, RLS/grants et rétention.
- Configurer Workers, domaine, WAF/rate limits, secrets, R2, observabilité et alertes.
- Créer Super Admin initial par procédure sécurisée, imposer TOTP et tester récupération.
- Configurer Agences pilotes, WhatsApp, commissions, échéances et KYB.
- Former ADMIN/COMPTABLE à la déclaration `A-12`, correction motivée et portée informative.
- Vérifier qu’aucun secret ou compte de test n’est conservé.

Preuves : revue à quatre yeux et inventaire de configuration.

#### `S5-006` — Répétition opérationnelle — P0

Répéter de bout en bout :

- trois portes, Google/OTP, invitation et changement de contexte ;
- création/reprise Agence, KYB et capacité FedaPay ;
- échéance, avance multi-mois, paiement FedaPay et manuel ;
- webhook, ledger, reçu, notification et rapprochement ;
- déclaration unitaire/en lot, rejeu, erreur de sélection, correction motivée et notification Propriétaire ;
- point mensuel Propriétaire, loyer en retard, disponibilité datée et WhatsApp ;
- remboursement intégral externe et double charge ;
- suspension Agence pendant paiement engagé ;
- panne, DLQ, restauration et réconciliation.

Preuves : procès-verbal, chronologie et actions résiduelles classées.

#### `S5-007` — Pilote limité — P1

- Ouvrir à un petit nombre d’Agences après `GATE-0` à `GATE-5`.
- Monitorer SLO, erreurs, paiements, queues, notifications, usages Auth et corrections de disponibilité.
- Collecter retours séparés Agence/Locataire/Propriétaire sans modifier le périmètre en direct.
- Traiter immédiatement P0/P1 ; placer le reste dans backlog post-V1.
- Vérifier quotidiennement rapprochement et absence de fuite inter-contextes.

Preuves : métriques, journal pilote et synthèse des retours.

#### `S5-008` — Go/no-go — P0

- Réunir produit, technique, sécurité, finance, exploitation et conformité.
- Vérifier chaque exigence, AC, risque, runbook et dette acceptée.
- Refuser le GO en cas d’écart financier, RLS, reprise, Auth, FedaPay ou compréhension de la disponibilité Propriétaire.
- Documenter décision, périmètre ouvert, limites connues, rollback et responsables.
- Créer le tag de release seulement après décision GO signée.

Preuves : décision auditée, release notes et plan de surveillance.

### 8.3 Porte de sortie `GATE-5`

- [ ] Aucun P0/P1 sécurité, finance, RLS, Auth ou reprise n’est ouvert.
- [ ] Les SLO et budgets passent en charge et en panne.
- [ ] La restauration complète respecte RPO/RTO et n’entraîne aucun double effet.
- [ ] Supabase Auth/SMTP/MFA, Data API/RLS, Queues et Storage sont validés en production.
- [ ] Cloudflare Workers/R2/Browser Run, secrets et alertes sont validés.
- [ ] FedaPay réel limité, double charge et remboursement externe sont maîtrisés.
- [ ] Agence et Propriétaire comprennent la nature déclarative de la disponibilité ; aucun parcours de remise de fonds n’existe.
- [ ] Le pilote limité et le rollback sont autorisés par écrit.

## 9. Matrice de traçabilité des exigences

| Domaine PRD | Règles/AC/NFR associés | Sprints et tâches dominantes | Écrans DESIGN |
|---|---|---|---|
| Auth, invitations et trois portes `FR-001` à `FR-005` | `BR-041` à `BR-043`, `AC-008`, `AC-014`, `NFR-014` à `NFR-016` | `S0-003`, `S0-004`, `S1-002` à `S1-007`, `S1-009`, `S5-001` | `X-01` à `X-06` |
| Agence, onboarding et référentiels `FR-010` à `FR-013` | `BR-029`, `BR-040`, `BR-042`, `AC-014` | `S0-006`, `S1-003`, `S2-001` à `S2-003`, `S4-002` | `A-01` à `A-06`, `A-11`, `A-16`, `A-17` |
| Affectations et échéances `FR-020` à `FR-023` | `BR-030` à `BR-036` | `S2-004`, `S2-005`, `S2-007` | `A-07`, `A-08`, `L-01` à `L-03`, `O-01`, `O-02` |
| Paiement FedaPay `FR-030` à `FR-037` | `BR-001` à `BR-013`, `AC-001` à `AC-003`, `AC-005`, `AC-011`, `AC-013` | `S0-002`, `S3-001` à `S3-005`, `S3-012`, `S5-004` | `L-04` à `L-06`, `A-09`, `A-10`, `A-17` |
| Paiement manuel `FR-040` à `FR-043` | `BR-001`, `BR-005`, `AC-004` | `S3-001`, `S3-006`, `S3-007`, `S4-002` | `A-09`, `A-10`, `L-07` |
| Reçus `FR-050` à `FR-052` | `BR-010` à `BR-013`, `NFR-006` | `S3-007`, `S4-001`, `S4-008` | `L-05`, `L-07`, `A-14` |
| Commissions et Propriétaire `FR-060` à `FR-063` | `BR-020` à `BR-029`, `BR-044`, `AC-006`, `AC-012`, `AC-015` | `S0-005`, `S2-003`, `S3-001`, `S3-008`, `S3-009`, `S4-003` | `A-11`, `A-12`, `A-15`, `O-01` à `O-04`, `S-02`, `S-03` |
| Dashboards et exports `FR-070` à `FR-075` | `BR-011`, `BR-012`, `AC-009`, `AC-015`, `NFR-013` | `S2-007`, `S4-001` à `S4-003`, `S4-005` à `S4-009` | `L-01` à `L-08`, `A-02`, `A-14`, `O-01` à `O-04` |
| Notifications/WhatsApp `FR-080` à `FR-084` | `AC-010`, `AC-015`, `NFR-006` | `S2-006`, `S3-011`, `S4-001` à `S4-004` | `N-01`, `N-02`, `L-08`, `A-15`, `O-04` |
| Remboursement externe `FR-090` à `FR-092` | `BR-007`, `AC-007`, `AC-011` | `S3-010`, `S3-012`, `S5-006` | `L-08`, `A-09`, `A-13`, `S-04` |
| Super Admin `FR-100`, `FR-101` | `BR-021` à `BR-029`, `AC-008`, `NFR-008` | `S1-007`, `S3-008`, `S4-004`, `S5-001` | `X-06`, `S-01` à `S-06` |
| Qualité transversale | `NFR-001` à `NFR-016` | `S0-006` à `S0-009`, `S1-001`, `S4-005` à `S4-009`, `S5-001` à `S5-008` | tous |

## 10. Risques et réponses

| ID | Risque | Signal | Réponse et porte |
|---|---|---|---|
| `R-001` | contrat FedaPay incomplet | état ou idempotence non prouvé | documentation officielle + sandbox + tests de contrat ; bloque `GATE-0` |
| `R-002` | double charge | deux charges pour une génération | référence stable, lookup après timeout, réconciliation ; `GATE-3` |
| `R-003` | faux paiement | navigateur ou webhook forgé | webhook signé + mapping versionné + inbox ; `GATE-3` |
| `R-004` | confusion balance/disponibilité | état Propriétaire dérivé du fournisseur | déclaration manuelle seule + scan anti-périmètre ; `GATE-3/4` |
| `R-005` | déclaration Agence erronée | mauvais lot ou mauvais rôle | validation tout-ou-rien, idempotence, correction motivée, audit ; `GATE-3` |
| `R-006` | fuite multi-agence | IDOR ou politique manquante | grants minimaux, FORCE RLS, pgTAP et tests E2E ; `GATE-1/5` |
| `R-007` | `service_role` exposée | secret dans bundle/log | séparation stricte, scan et rotation ; `GATE-1/5` |
| `R-008` | doublon Auth | Google/OTP créent deux profils métier | `auth.users.id` canonique, liaison Supabase standard, aucun moteur maison ; `GATE-1` |
| `R-009` | porte utilisée comme rôle | accès créé depuis intention | résolution serveur des rattachements ; `GATE-1/4` |
| `R-010` | OTP inutilisable en production | SMTP par défaut limité | SMTP transactionnel, limites et monitoring ; `GATE-0/5` |
| `R-011` | perte ou double traitement async | table et Queue divergent | transaction état + `pgmq.send`, sweeper, idempotence, DLQ ; `GATE-1/3` |
| `R-012` | trou RPO fournisseur | charge absente après PITR | enveloppe R2 pré-appel + relecture marchand/fenêtre ; `GATE-0/5` |
| `R-013` | reçu accessible à tort | URL durable ou cache | Storage privé, URL courte et contrôle d’accès ; `GATE-3/4` |
| `R-014` | chiffres Propriétaire trompeurs | attendu/encaissé/disponible fusionnés | métriques séparées et tests `AC-015` ; `GATE-4` |
| `R-015` | réintroduction d’un workflow de fonds | statut « retiré » ou solde | exclusion normative, scan code/UI/schema ; toutes portes |
| `R-016` | code non maintenable | PR massives ou CI contournée | branche protégée, CODEOWNERS, DoD et revues ; toutes portes |
| `R-017` | dépendance Cloudflare/Supabase mal bornée | timeout ou coût inattendu | budgets, observabilité et test de panne ; `GATE-0/5` |
| `R-018` | non-conformité APDP | base légale/rétention absente | revue et registre avant pilote ; `GATE-0/5` |

## 11. Plan de tests transversal

| Suite | Portée minimale | Exécution |
|---|---|---|
| Unitaire domaine | montants, taux, dates, états, agrégats, transitions de disponibilité | chaque PR |
| Propriétés | ledger équilibré, idempotence, ordre indivisible, lot atomique | chaque PR financière |
| SQL/pgTAP | contraintes, grants, RLS allow/deny, fonctions privilégiées | CI |
| Contrat API | DTO par audience, erreurs, idempotence, OpenAPI | CI |
| Auth E2E | trois portes, Google, OTP, invitation, multi-contextes, MFA | CI/staging |
| Paiement E2E | manuel, FedaPay sandbox, webhook, reçu, correction | staging |
| Asynchrone | crash, retry, double livraison, visibilité, DLQ, sweeper | CI/staging |
| Disponibilité | TO_CONFIRM, batch, rejeu, correction, remboursement, notification | CI/staging |
| UX visuelle | règles Loya de `L-01` à `L-05`, matrice responsive, états et reflow | chaque PR UI |
| Accessibilité | axe + clavier + lecteur d’écran + zoom | chaque sprint |
| Sécurité | IDOR, élévation, secrets, dépendances, webhook, fichiers | CI + avant pilote |
| Performance | Core Web Vitals, p75/p95, DB, Worker, files | Sprint 4/5 |
| Reprise | PITR Supabase, R2, relecture FedaPay, Queues/Storage | avant pilote puis périodique |
| Anti-périmètre | UI, routes, schéma, migrations et termes interdits | chaque PR + release |

Chaque test de mutation financière ou de disponibilité couvre au minimum succès, refus d’autorisation, autre Agence, rejeu, concurrence et crash au point de commit.

## 12. Livrables par porte

| Porte | Livrables obligatoires |
|---|---|
| `GATE-0` | contrats techniques et fournisseur prouvés, matrice de preuves, prototypes UX, modèle de menace, SLO/RPO/RTO, revue APDP |
| `GATE-1` | monorepo/CI, environnements, Auth Supabase, RLS, invitations, audit, Queues, shells |
| `GATE-2` | onboarding, référentiels, taux, affectations, échéances et vues de base |
| `GATE-3` | ledger, paiements, webhook, receipts, commissions, disponibilités, notifications, rapprochement |
| `GATE-4` | 43 écrans finis, responsive, accessibilité, performance, exports et scan anti-périmètre |
| `GATE-5` | audits sécurité/charge, restauration, configuration production, répétition, pilote et décision |

## 13. Backlog explicitement non créé

Aucun ticket V1 ne doit implémenter :

- paiement ou remboursement partiel ;
- contrat, document de bail juridique, signature ou état des lieux ;
- maintenance, travaux, ticket, réclamation ou signalement interne ;
- import de données ou migration client automatisée ;
- rapport avancé ou moteur BI ;
- export CSV/Excel Propriétaire ;
- remboursement déclenché depuis Loya ;
- suivi de balance, disponibilité réelle ou règlement FedaPay ;
- transfert, reversement, retrait, confirmation de remise, justificatif ou solde restant entre Agence et Propriétaire ;
- mot de passe local, OTP téléphone, SMS ou WhatsApp d’authentification ;
- liaison d’identités, sessions ou OTP maison remplaçant Supabase Auth ;
- application mobile native ;
- Redis/BullMQ, D1, Fastify, Next.js ou toute autre substitution du socle Loya V1.

Une découverte utile hors périmètre est enregistrée comme proposition post-V1, sans code dormant ni feature flag caché.

## 14. Checklist finale de livraison

### Produit et finance

- [ ] Toute échéance est entière ; aucun montant libre n’existe.
- [ ] Les avances multi-mois et multi-logements respectent une seule Agence par charge.
- [ ] Les frais FedaPay restent uniquement dans le contexte Locataire.
- [ ] Le principal, les commissions et le net Propriétaire sont exacts et figés.
- [ ] Un paiement confirmé crée `TO_CONFIRM` sans dépendre d’une balance fournisseur.
- [ ] Seuls ADMIN/COMPTABLE déclarent `AVAILABLE_WITH_AGENCY`, individuellement ou en lot atomique.
- [ ] Une correction exige un motif ; un rejeu n’envoie pas deux notifications.
- [ ] Un remboursement valide retire la disponibilité courante ; une double charge corrigée ne la modifie pas.
- [ ] Le point mensuel sépare attendu, encaissé, retard et déclaré disponible.
- [ ] Aucun transfert, retrait, preuve ou solde restant Propriétaire n’existe.

### Authentification et autorisation

- [ ] L’accueil affiche trois portes vers un panneau Auth commun.
- [ ] Supabase Auth gère Google et OTP e-mail ; SMTP production est configuré.
- [ ] Le même e-mail vérifié converge vers le même `auth.users.id` selon le standard Supabase.
- [ ] Une intention, Google ou OTP ne crée aucun droit métier.
- [ ] Invitations et rattachements sont explicites, atomiques et auditables.
- [ ] TOTP `aal2` protège Super Admin et actions plateforme sensibles.
- [ ] Aucun secret/`service_role` n’atteint le navigateur.
- [ ] Data API, grants, RLS et fonctions privilégiées ont des tests allow/deny.

### Architecture et reprise

- [ ] React/Vite, Hono/Workers et Supabase correspondent au STI.
- [ ] Inbox/outbox et Supabase Queues résistent aux doubles livraisons et crashs.
- [ ] R2 est écrit avant appel FedaPay ; la restauration retrouve les charges absentes.
- [ ] Browser Run génère les PDF et Storage privé protège les reçus.
- [ ] SLO, RPO/RTO, alertes et runbooks sont mesurés et exécutés.
- [ ] Aucun état Propriétaire n’est reconstruit depuis une hypothèse FedaPay.

### UX, accessibilité et qualité

- [ ] Les 43 écrans sont couverts et `L-01` à `L-05` respectent intégralement leurs règles Loya.
- [ ] 320–1440 px, zoom 400 %, clavier et lecteur d’écran passent.
- [ ] « insolvable » n’apparaît pas ; « loyer en retard/impayé » est utilisé.
- [ ] La date et le caractère informatif de la disponibilité sont visibles.
- [ ] GitHub impose branche protégée, revues, CODEOWNERS et CI verte.
- [ ] Migrations, tests, observabilité, rollback et documentation accompagnent chaque PR.
- [ ] Le scan anti-périmètre ne signale aucun écart.
- [ ] L’audit individuel de chaque document et l’audit croisé final sont GO.

## 15. Critère final

La V1 peut être ouverte au pilote uniquement si les six portes sont vertes, les 54 tâches possèdent leurs preuves, les exigences PRD sont traçables jusqu’aux tests et écrans, et aucun écart de sécurité, finance, isolation, reprise ou périmètre n’est accepté implicitement.

## 16. Index d’exécution par tâche

L’index ci-dessous est obligatoire dans chaque ticket et PR. Les sections STI/DESIGN détaillées restent les références normatives ; les preuves indiquées sont le minimum, jamais le maximum.

### Sprint 0

| Tâche | Exigences dominantes | Écrans | Preuve minimale |
|---|---|---|---|
| `S0-001` | tous OBJ/FR/BR/AC/NFR | tous | baseline, matrice et scan |
| `S0-002` | `FR-030` à `FR-037`, `BR-005` à `BR-012`, `AC-005`, `AC-011` | `L-04` à `L-07`, `A-09`, `A-17` | contrat et sandbox FedaPay |
| `S0-003` | `FR-001` à `FR-005`, `BR-041` à `BR-043`, `AC-014`, `NFR-014` | `X-01` à `X-06` | Auth/SMTP/MFA POC |
| `S0-004` | `FR-003`, `AC-008`, `NFR-008`, `NFR-016` | `X-04`, `A-16`, `S-06` | RLS/grants pgTAP |
| `S0-005` | `FR-060` à `FR-063`, `BR-020` à `BR-029`, `BR-044`, `AC-006`, `AC-015` | `A-11`, `A-12`, `O-01` à `O-04` | formules et modèle |
| `S0-006` | `NFR-005` à `NFR-008`, `NFR-015`, `NFR-016` | tous | topologie et POC |
| `S0-007` | `FR-005`, `FR-061`, `FR-062`, `FR-071` à `FR-075`, `NFR-001` à `NFR-004`, `NFR-013` | `X-01` à `X-06`, `L-01` à `L-05`, `A-12`, `O-01` à `O-04` | prototypes testés |
| `S0-008` | `FR-061`, `FR-084`, `NFR-006`, `NFR-008`, `NFR-011` | `L-08`, `O-01` à `O-04` | registre et rétention |
| `S0-009` | `NFR-005`, `NFR-007`, `NFR-009`, `NFR-012`, `NFR-015` | `S-04` | restauration chronométrée |

### Sprint 1

| Tâche | Exigences dominantes | Écrans | Preuve minimale |
|---|---|---|---|
| `S1-001` | `NFR-001`, `NFR-008`, `NFR-015` | tous | CI et preview |
| `S1-002` | `FR-001`, `FR-004`, `NFR-006`, `NFR-015`, `NFR-016` | `X-01`, `X-02` | environnements et scans |
| `S1-003` | `FR-001` à `FR-003`, `FR-010`, `BR-042`, `BR-043` | `X-03`, `X-04`, `A-01`, `A-16` | migrations et concurrence |
| `S1-004` | `FR-003`, `AC-008`, `NFR-008`, `NFR-016` | `A-16`, `S-06` | matrice RLS/grants |
| `S1-005` | `FR-001`, `FR-004`, `FR-005`, `AC-014`, `NFR-014` | `X-01`, `X-02`, `X-04` à `X-06` | Auth E2E et MFA |
| `S1-006` | `FR-002`, `FR-003`, `BR-042`, `BR-043`, `AC-008` | `X-02` à `X-04`, `A-06`, `A-16` | invitations E2E |
| `S1-007` | `FR-010`, `FR-062`, `FR-100`, `FR-101`, `NFR-008` | `A-12`, `A-16`, `S-01`, `S-05`, `S-06` | permissions/audit |
| `S1-008` | `FR-082`, `BR-005`, `NFR-007`, `NFR-008` | `N-01`, `S-04` | crash/retry/DLQ |
| `S1-009` | `FR-003`, `FR-005`, `NFR-001` à `NFR-004`, `NFR-010`, `NFR-014` | `X-01` à `X-06`, shells A/L/O/S/N | captures et navigation |

### Sprint 2

| Tâche | Exigences dominantes | Écrans | Preuve minimale |
|---|---|---|---|
| `S2-001` | `FR-010`, `FR-011`, `BR-040`, `BR-042`, `AC-014` | `A-01`, `A-17` | onboarding E2E |
| `S2-002` | `FR-002`, `FR-012`, `FR-061` | `A-03` à `A-06`, `L-02`, `O-02` | CRUD/RLS sans import |
| `S2-003` | `FR-013`, `FR-060`, `FR-063`, `BR-020` à `BR-029`, `AC-006` | `A-11`, `S-02` | politiques versionnées |
| `S2-004` | `FR-020` à `FR-022`, `BR-030` à `BR-036` | `A-07`, `L-03`, `O-02` | affectation concurrente |
| `S2-005` | `FR-021` à `FR-023`, `FR-031`, `BR-001`, `BR-031` à `BR-036` | `A-08`, `L-03` | générateur idempotent |
| `S2-006` | `FR-080` à `FR-082` | `N-01`, `N-02` | échéances, rappels et retards dédupliqués |
| `S2-007` | `FR-070` à `FR-074`, `AC-008`, `AC-015` | `A-03` à `A-08`, `A-12`, `L-01` à `L-03`, `O-01`, `O-02` | vues paginées/RLS |

### Sprint 3

| Tâche | Exigences dominantes | Écrans | Preuve minimale |
|---|---|---|---|
| `S3-001` | `FR-060`, `BR-013`, `BR-020` à `BR-029`, `AC-006` | `A-09`, `A-11`, `O-03` | ledger équilibré |
| `S3-002` | `FR-030` à `FR-033`, `BR-001` à `BR-004`, `BR-008`, `BR-009`, `AC-001` à `AC-003`, `AC-013` | `L-04`, `L-05` | ordres concurrents |
| `S3-003` | `FR-032` à `FR-037`, `BR-005`, `BR-010`, `AC-011` | `L-05`, `L-06`, `A-17` | sandbox/reprise R2 |
| `S3-004` | `FR-034` à `FR-036`, `BR-005`, `AC-005` | `L-06`, `A-09` | webhook/inbox signé |
| `S3-005` | `FR-034`, `FR-035`, `FR-060`, `FR-062`, `BR-005`, `BR-006` | `A-02`, `A-09`, `A-12`, `O-04` | confirmation idempotente |
| `S3-006` | `FR-040` à `FR-043`, `AC-004` | `A-09`, `A-10`, `L-07` | paiement manuel atomique |
| `S3-007` | `FR-050` à `FR-052`, `BR-010` à `BR-012`, `NFR-006` | `L-07`, `A-14` | PDF/Storage privés |
| `S3-008` | `FR-063`, `BR-021` à `BR-029`, `AC-012` | `A-15`, `S-02`, `S-03` | relevés append-only |
| `S3-009` | `FR-061`, `FR-062`, `FR-072`, `BR-006`, `BR-044`, `AC-015` | `A-12`, `O-01` à `O-04` | lot/correction/audit |
| `S3-010` | `FR-090` à `FR-092`, `BR-007`, `AC-007`, `AC-011` | `A-09`, `A-13`, `L-08`, `S-04` | extourne/correction |
| `S3-011` | `FR-080` à `FR-084`, `AC-010`, `AC-015` | `N-01`, `N-02`, `A-15`, `O-04` | matrice par audience |
| `S3-012` | `FR-034` à `FR-036`, `FR-092`, `NFR-007` à `NFR-009` | `A-09`, `A-12`, `S-04` | rapprochement/runbook |

### Sprint 4

| Tâche | Exigences dominantes | Écrans | Preuve minimale |
|---|---|---|---|
| `S4-001` | `FR-030` à `FR-037`, `FR-050` à `FR-052`, `FR-071`, `FR-074`, `FR-075`, `NFR-013`, `NFR-014` | `X-01` à `X-05`, `L-01` à `L-08`, `N-01`, `N-02` | E2E/captures Loya |
| `S4-002` | `FR-010` à `FR-013`, `FR-040` à `FR-043`, `FR-060` à `FR-063`, `FR-070` | `A-01` à `A-17` | E2E Agence par rôle |
| `S4-003` | `FR-061`, `FR-062`, `FR-072`, `FR-084`, `AC-015`, `BR-044` | `O-01` à `O-04`, `N-01`, `N-02` | E2E lecture seule |
| `S4-004` | `FR-063`, `FR-100`, `FR-101`, `NFR-008` | `X-06`, `S-01` à `S-06` | MFA/permissions |
| `S4-005` | `NFR-001` à `NFR-004`, `AC-009` | tous | matrice responsive |
| `S4-006` | `NFR-002` à `NFR-004`, `NFR-010`, `NFR-014` | tous | audit WCAG |
| `S4-007` | `NFR-007`, `NFR-012`, `NFR-013`, `NFR-015` | tous | budgets p75/p95 |
| `S4-008` | `FR-050` à `FR-052`, `FR-073`, `BR-011`, `BR-012`, `NFR-006` | `L-07`, `A-14`, `O-01` à `O-04` | fichiers/exports négatifs |
| `S4-009` | périmètre PRD, `BR-001`, `BR-007`, `BR-044`, `NFR-010`, `NFR-013` | tous | scan anti-périmètre |

### Sprint 5

| Tâche | Exigences dominantes | Écrans | Preuve minimale |
|---|---|---|---|
| `S5-001` | `AC-008`, `AC-014`, `NFR-006`, `NFR-008`, `NFR-011`, `NFR-016` | `X-01` à `X-06`, `A-16`, `S-05`, `S-06` | audit sécurité |
| `S5-002` | `NFR-005`, `NFR-007`, `NFR-012`, `NFR-014`, `NFR-015` | `X-01`, `L-06`, `N-01`, `S-04` | charge/pannes |
| `S5-003` | `FR-034`, `FR-062`, `NFR-007` à `NFR-009`, `NFR-015` | `A-12`, `O-04`, `S-04` | restauration RPO/RTO |
| `S5-004` | `FR-030` à `FR-037`, `BR-005`, `BR-006`, `AC-001`, `AC-011` | `L-04` à `L-07`, `A-09`, `A-12` | validation production |
| `S5-005` | `FR-001`, `FR-010`, `FR-062`, `FR-063`, `NFR-011`, `NFR-015`, `NFR-016` | `X-06`, `A-01`, `A-12`, `A-17`, `S-02`, `S-03` | configuration relue |
| `S5-006` | tous AC, `BR-001` à `BR-013`, `BR-020` à `BR-036`, `BR-040` à `BR-044` | parcours critiques A/L/O/S/X/N | répétition signée |
| `S5-007` | `OBJ-001` à `OBJ-009`, `NFR-007`, `NFR-011` à `NFR-016` | tous | métriques pilote |
| `S5-008` | tous AC/NFR et DoD PRD | tous | décision GO/no-go |

### 16.7 Rattachement STI obligatoire par tâche

Cette table complète les six index de sprint précédents. Chaque ticket et chaque PR doit citer au moins l’une des sections STI indiquées ; une section plus précise peut être ajoutée sans supprimer ce rattachement minimal.

| Tâche | Sections STI normatives minimales |
|---|---|
| `S0-001` | §§ 0, 22 et 23 |
| `S0-002` | §§ 10, 18.4 et 21 |
| `S0-003` | §§ 8, 18.3 et 21 |
| `S0-004` | §§ 7, 18.2 et 21 |
| `S0-005` | §§ 4 à 6 et 21 |
| `S0-006` | §§ 1, 13 à 14, 19.4 et 21 |
| `S0-007` | §§ 9.4, 15 et 18.5 |
| `S0-008` | §§ 16 et 21 |
| `S0-009` | §§ 17, 20 et 21 |
| `S1-001` | §§ 1.2 et 19 |
| `S1-002` | §§ 19.1 et 19.4 |
| `S1-003` | §§ 3.2 à 3.4 |
| `S1-004` | §§ 7.1 à 7.5 et 18.2 |
| `S1-005` | §§ 8.1 à 8.4 et 18.3 |
| `S1-006` | §§ 8.5 et 9.2 |
| `S1-007` | §§ 7.4 et 16.3 |
| `S1-008` | §§ 14.1 et 17.3 |
| `S1-009` | §§ 9.4, 15 et 18.5 |
| `S2-001` | §§ 7.4, 9.2 et 18.5 |
| `S2-002` | §§ 3.2 à 3.4 et 9.2 |
| `S2-003` | §§ 4.3 à 4.4 et 9.3 |
| `S2-004` | §§ 3.2 à 3.4 et 6.1 |
| `S2-005` | §§ 3.3 à 3.4, 6.1 et 14.4 |
| `S2-006` | §§ 14.2 et 14.4 |
| `S2-007` | §§ 7.3 et 9.4 |
| `S3-001` | §§ 4 et 5 |
| `S3-002` | §§ 6.2, 9.3 et 10.2 |
| `S3-003` | §§ 10.1 à 10.2 et 20 |
| `S3-004` | §§ 10.3 et 14.1 |
| `S3-005` | §§ 10.4 à 10.6 |
| `S3-006` | §§ 9.3 et 11 |
| `S3-007` | § 13 |
| `S3-008` | §§ 4.4, 6.3 et 9.3 |
| `S3-009` | §§ 3.3 à 3.4, 6.3 et 9.3 |
| `S3-010` | § 12 |
| `S3-011` | § 14.2 |
| `S3-012` | §§ 14.5, 17 et 20 |
| `S4-001` | §§ 9.4, 10.2, 13, 15 et 18.5 |
| `S4-002` | §§ 9.2 à 9.4, 11, 12 et 14 |
| `S4-003` | §§ 7.2 à 7.3 et 9.4 |
| `S4-004` | §§ 7.2, 8.4, 9.2 et 16.3 |
| `S4-005` | §§ 15 et 18.5 |
| `S4-006` | §§ 16 et 18.5 |
| `S4-007` | §§ 17 et 19.4 |
| `S4-008` | §§ 9.4, 13.2 et 16.1 |
| `S4-009` | §§ 18.6 et 23 |
| `S5-001` | §§ 7, 8, 16 et 18 |
| `S5-002` | §§ 15, 17 et 18 |
| `S5-003` | § 20 |
| `S5-004` | §§ 10, 18.4 et 20 |
| `S5-005` | §§ 19.1, 19.4 et 21 |
| `S5-006` | §§ 18.5 et 20 |
| `S5-007` | §§ 17 et 18.5 |
| `S5-008` | § 23 |
