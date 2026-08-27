# GATE-0 — Décisions et preuves

Statut global : **ROUGE — passage au Sprint 1 interdit pour les dépendances concernées**.

Date du constat initial : **2026-08-26**. Dernière mise à jour décisionnelle : **2026-08-27**. Ce fichier est un registre de preuve, pas une nouvelle source métier. Les seules sources normatives sont le [PRD](../../PRD_Gestion_Locative_IA_V1.md), le [STI](../../STI_Gestion_Locative_IA_V1.md), le [DESIGN](../../DESIGN_Gestion_Locative_IA_V1.md), la [ROADMAP](../../ROADMAP_Gestion_Locative_IA_V1.md) et la [maquette Locataire](../../maquette%20%C3%A9crans%20locataire.png). Une documentation fournisseur citée ici ne peut que prouver une capacité technique ; elle ne change aucune règle Loya.

La ROADMAP impose l'ordre des sprints et interdit de franchir une porte non prouvée (ROADMAP, l. 10–19). `GATE-0` exige des preuves exécutables et versionnées, pas la seule présence d'une spécification (ROADMAP, l. 109–124 et 226–235).

## Décisions utilisateur enregistrées le 2026-08-27

L'approbation explicite de l'utilisateur clôt la question décisionnelle, mais ne constitue pas une preuve de correction des sources, d'implémentation ou de test. Les preuves manquantes ci-dessous maintiennent donc les critères concernés à leur statut factuel actuel.

| Question | Choix approuvé                                                                                                           | Preuve restant à produire                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `OQ-001` | A — applications → points d'entrée publics des packages ; jamais packages → applications                                 | Produite : règles de frontière et tests positifs/négatifs dans `check:boundaries`     |
| `OQ-003` | B — seuls les échecs techniques pré-acceptation laissent l'ordre `CREATED`; l'échec terminal fournisseur termine l'ordre | Implémentation et tests timeout/lookup/concurrence de la table transcrite dans le STI |
| `OQ-004` | A — CTA long « DÉCLARER DISPONIBLE AUPRÈS DE L'AGENCE » sur bandeau et confirmation                                      | Prototype et E2E de la correction transcrite dans le DESIGN                           |
| `OQ-005` | A — cocher aussi 600 000 FCFA ; principal 1 350 000 FCFA, puis frais du devis valide                                     | Captures conformes et assertion `principal + frais = total`                           |
| `OQ-006` | A — corriger la maquette et suivre strictement ordre, champs et libellés du DESIGN                                       | Maquette, captures responsive et tests du devis                                       |
| `OQ-007` | A — remplacer Orange Money par Celtiis Cash dans la maquette                                                             | Maquette corrigée et mapping fournisseur prouvé                                       |
| `OQ-008` | A — corriger libellés, CTA et dates de `L-03` selon le DESIGN                                                            | Maquette corrigée et tests contenu/WhatsApp/date                                      |

Source de la preuve décisionnelle : approbation explicite de l'utilisateur le **2026-08-27**, consignée avec l'historique complet dans [OPEN-QUESTIONS.md](../decisions/OPEN-QUESTIONS.md).

## Légende de statut

- **VERT** : preuve locale ou externe identifiée, rejouable et concluante pour le critère exact.
- **ROUGE** : une preuve échoue ou un écart concret contredit le critère.
- **NON PROUVÉ** : aucune preuve suffisante n'est disponible ; ce statut est bloquant au même titre que rouge.

## Constat local reproductible

| Vérification                    | Résultat observé                                                                                                                                 | Statut                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `pnpm check:baseline`           | `5/5` empreintes SHA-256 valides, maquette incluse                                                                                               | VERT                                         |
| `pnpm check:traceability`       | `123` exigences, `54` tâches, `43` écrans ; matrice à jour et aucune référence orpheline                                                         | VERT                                         |
| `pnpm check:scope`              | aucun écart ; toutes les familles exclues PRD/ROADMAP et les substitutions de stack sont couvertes                                               | VERT                                         |
| `pnpm test`                     | `55/55` tests réussis : `36` garde-fous Node, `12` unitaires et `7` dans le runtime Workers                                                      | VERT                                         |
| Supabase local / pgTAP en CI    | PR `#9`, run `33076539448` : reset PostgreSQL complet, `1` fichier et `6` assertions de plateforme, `Result: PASS`                               | VERT pour le harnais, RLS Loya NON PROUVÉE   |
| `pnpm test:e2e`                 | `6/6` scénarios Chromium réussis : `X-01` et cycle réel PWA à trois onglets avec rechargement consenti                                           | VERT local                                   |
| `pnpm check`                    | baseline, traçabilité, périmètre, frontières, format, lint, types Wrangler/TypeScript, tests et builds tous réussis                              | VERT                                         |
| `pnpm audit --audit-level high` | aucune vulnérabilité connue après mise à niveau de `sharp` transitif                                                                             | VERT                                         |
| État Git de la baseline         | branche `chore/s0-baseline`, arbre local identique à l'arbre distant ; commits créés par l'API GitHub et signatures marquées `verified: true`    | VERT                                         |
| Dépôt distant                   | `urbainmorel/loya`, visibilité publique, branche par défaut `main`                                                                               | VERT, preuve secondaire hors critères métier |
| CI distante                     | PR `#9` : `Quality and secrets` vert en 3 min 04 s avec installation figée, Gitleaks, audit SCA, `pnpm check`, Supabase/pgTAP, E2E et smoke HTTP | VERT                                         |
| Squelette produit               | monorepo pnpm avec React/Vite PWA, Hono Worker, schémas partagés, configuration Supabase locale et manifeste Wrangler                            | VERT local                                   |
| POC Cloudflare Web/Worker       | déployé sur `loya-s0-topology-poc.morelhouanho.workers.dev` ; `/` HTML+CSP, `/v1/health` JSON, `/v1` et inconnues API en `404` JSON              | VERT local et externe                        |
| POC Supabase/FedaPay            | harnais PostgreSQL/pgTAP de plateforme prouvé ; aucune migration métier, Auth/RLS/Queues, sandbox ou charge fournisseur activée                  | PARTIEL technique, produit NON PROUVÉ        |

Les contrôles documentaires prouvent la cohérence des références, pas la faisabilité opérationnelle de Supabase, Cloudflare ou FedaPay. Le scan anti-périmètre couvre les familles d'exclusions verrouillées par motifs source, dépendances et manifestes ; les exigences positives de stack s'activent dès la présence d'un manifeste applicatif.

## Décision de porte

| Critère de sortie `GATE-0`                                                 | Statut     | Justification factuelle                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ensemble normatif et matrice sans référence orpheline                      | VERT local | Manifeste SHA-256, matrice générée et contrôles `check:baseline`/`check:traceability` réussis. ROADMAP, l. 228.                                                                                                                                                            |
| Contrat FedaPay : signature, idempotence, devis, relecture, double charge  | NON PROUVÉ | Aucun rapport sandbox, fixture signée, mapping fournisseur ou test de concurrence. ROADMAP, l. 229 ; PRD, l. 624 ; STI, l. 760–789.                                                                                                                                        |
| Supabase Auth : Google, OTP e-mail, même UUID, SMTP, intentions et MFA     | NON PROUVÉ | La configuration locale expurgée et le prototype `X-01` existent ; projet distant, fournisseurs, continuation serveur, SMTP, convergence d’identité, MFA et E2E Auth réels restent non prouvés. ROADMAP, l. 230 ; STI, l. 536–581.                                         |
| Data API, grants, RLS, JWT utilisateur et fonctions privilégiées minimales | NON PROUVÉ | La configuration locale `api` et le harnais pgTAP de plateforme sont prouvés, mais aucune migration Loya, matrice de privilèges, policy allow/deny ou suite pgTAP RLS. ROADMAP, l. 231 ; STI, l. 440–534.                                                                  |
| Topologie Workers + Supabase, Queues, Storage, R2 et Browser Run           | PARTIEL    | PWA Static Assets + API Hono same-origin prouvées localement et sur Cloudflare ; Supabase Auth/RLS/Queues, Storage, R2, Browser Run et Worker→Supabase/FedaPay restent non prouvés. ROADMAP, l. 232 ; STI, l. 20–73 et 1249–1253.                                          |
| Ledger, commissions et disponibilité déclarative                           | NON PROUVÉ | Formules normatives présentes, mais aucun domaine exécutable, test de propriété, migration ou modèle contrôlé. ROADMAP, l. 233 ; STI, l. 304–438.                                                                                                                          |
| Prototypes `X-01..X-06`, `L-01..L-05`, `A-12`, `O-01..O-04`                | ROUGE      | `X-01` possède un prototype interactif et des tests structurels ; `X-02..X-06`, `A-12` et `O-01..O-04` manquent, tandis que `L-01..L-05` reste une maquette statique non testée. Les décisions `OQ-004..008` ne sont pas encore matérialisées. ROADMAP, l. 193–202 et 234. |
| APDP, rétention, SLO, RPO/RTO et restauration avec décision signée         | NON PROUVÉ | Aucun registre, DPIA/décision, matrice de rétention, seuil chiffré ou exercice de restauration. ROADMAP, l. 204–224 et 235 ; PRD, l. 624–632.                                                                                                                              |

Conclusion : le premier critère de sortie est vert localement, mais les sept autres ne le sont pas. `GATE-0` reste donc **ROUGE**.

## S0-001 — Baseline documentaire et traçabilité — P0

Références : ROADMAP, l. 117–124 et 1001–1004 ; STI, l. 10–18, 1287–1346.

| Critère                                                                            | Statut     | Preuve locale ou manque                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Figer PRD, STI, DESIGN et ROADMAP comme ensemble normatif unique                   | VERT       | `docs/normative-manifest.json` fige les quatre documents et la maquette par SHA-256 ; `check:baseline` et son test passent.                                                                                                                                                                                                                                                           |
| Générer exigences → tâches → écrans → tests/preuves                                | VERT       | `docs/traceability/requirements-matrix.json` est régénérable ; `check:traceability` couvre 123 exigences, 54 tâches et 43 écrans.                                                                                                                                                                                                                                                     |
| Détecter les références orphelines                                                 | VERT       | Test positif et test injectant `FR-999` présents et réussis.                                                                                                                                                                                                                                                                                                                          |
| Détecter automatiquement toutes les fonctions exclues                              | VERT local | `check:scope` couvre les familles verrouillées : paiement partiel, contrats, états des lieux, maintenance/tickets, BI, imports, exports Propriétaire, remboursements fournisseur, balances/retraits FedaPay, reversements, cantonnement, IA visible, Auth locale/téléphone, identité maison et application native. Les tests négatifs passent. PRD, l. 121–139 ; ROADMAP, l. 925–943. |
| Détecter les divergences de stack                                                  | VERT local | Les substitutions Node/Next/Fastify/Redis/BullMQ/D1/native sont refusées. Le squelette exige React/Vite, Hono/Wrangler et Supabase. `check:boundaries` prouve `OQ-001` par tests positifs/négatifs : applications → points d'entrée publics des packages, jamais l'inverse. STI, l. 53–73 et 87–110.                                                                                  |
| Formaliser règles de périmètre, configuration et migration                         | VERT local | `README.md`, `CONTRIBUTING.md`, `.node-version`, `package.json`, CI et scan formalisent le socle, expansion–contraction, N/N−1 et interdictions de base. Le choix concret du mécanisme de rollback reste ouvert dans `OPEN-QUESTIONS.md`.                                                                                                                                             |
| Commit signé, index reproductible, configuration contrôlée, rapport anti-périmètre | VERT       | Commits signés par GitHub et vérifiés par son API, arbre indexé rejoué dans un checkout propre, CI distante verte et rapport anti-périmètre exhaustif pour les familles verrouillées.                                                                                                                                                                                                 |

Statut de tâche : **VERT pour les livrables et preuves de `S0-001`**. `OQ-001` est résolue et appliquée au squelette par `check:boundaries` ; `OQ-011` reste ouverte et bloque la politique de rollback de ses dépendances, sans invalider la baseline qui la détecte et la consigne.

## S0-002 — Contrat FedaPay — P0

Références : ROADMAP, l. 126–144 et 1004 ; PRD, l. 209–241 et 620–632 ; STI, l. 760–885 et 1185–1195.

| Critère                                                                 | Statut                                    | Preuve locale ou externe attendue                                                                                                                                                                                                               |
| ----------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sous-comptes/marketplace, KYB Agence, marchand, XOF et états            | NON PROUVÉ                                | Contrat commercial/technique, compte sandbox et mapping versionné absents.                                                                                                                                                                      |
| Corps brut, signature, timestamp, anti-rejeu, ID événement et retries   | NON PROUVÉ                                | La documentation FedaPay décrit `X-FEDAPAY-SIGNATURE`, doublons et retries, mais aucune fixture expurgée ni vérification Hono n'existe.                                                                                                         |
| Devis de frais Locataire, expiration et principal + frais = total       | NON PROUVÉ                                | Aucun endpoint sandbox ou tarif contractuel versionné ne prouve un devis avant débit. STI, l. 778–789, bloque l'activation si cette propriété manque.                                                                                           |
| Mobile Money et carte hébergée sans donnée carte Loya                   | NON PROUVÉ                                | Canaux et checkout réels non validés. `OQ-007` est résolue par le choix A (Celtiis Cash remplace Orange Money), mais la maquette et le mapping fournisseur ne sont pas encore corrigés/prouvés.                                                 |
| `merchantReference`, idempotence, lookup après timeout et double charge | NON PROUVÉ                                | Aucun test de création concurrente ou lookup par référence.                                                                                                                                                                                     |
| Retry tentative/ordre                                                   | VERT décisionnel, NON PROUVÉ exécutable   | `OQ-003` est résolue par le choix B et transcrite dans le STI : seul un échec technique pré-acceptation laisse l'ordre `CREATED`; un échec terminal fournisseur termine l'ordre. L'implémentation et les tests restent absents de cette preuve. |
| Relecture par marchand et fenêtre après restauration                    | NON PROUVÉ                                | Aucun contrat, compte retiré testable ni rapport de fenêtre.                                                                                                                                                                                    |
| Remboursement intégral exécuté hors Loya                                | NON PROUVÉ                                | Règle Loya écrite, comportement fournisseur et runbook non validés.                                                                                                                                                                             |
| `PAID` indépendant de la disponibilité des fonds                        | VERT documentaire, NON PROUVÉ fournisseur | Invariant explicite dans PRD/STI/ROADMAP ; aucun test sandbox.                                                                                                                                                                                  |
| Disponibilité Propriétaire toujours manuelle                            | VERT documentaire, NON PROUVÉ exécutable  | Invariant explicite ; aucun modèle/test exécutable.                                                                                                                                                                                             |
| Aucun reversement Propriétaire géré                                     | VERT documentaire, NON PROUVÉ exécutable  | Aucune implémentation métier existe encore ; le scan n'est pas exhaustif.                                                                                                                                                                       |
| Fixtures, rapport sandbox, contrat, mapping et concurrence              | NON PROUVÉ                                | Livrables absents.                                                                                                                                                                                                                              |

Preuve officielle secondaire : [Webhooks et événements FedaPay](https://docs.fedapay.com/integration-api/en/webhooks-en). Cette page confirme une signature et des redéliveries, mais ne prouve pas à elle seule l'ensemble du contrat Loya.

Statut de tâche : **NON PROUVÉ**.

## S0-003 — Supabase Auth et trois portes — P0

Références : ROADMAP, l. 146–157 et 1005 ; PRD, l. 143–169 ; STI, l. 536–581 et 1173–1183 ; DESIGN, l. 120–188.

| Critère                                                                                      | Statut                    | Preuve locale ou externe attendue                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google OAuth + OTP e-mail, sans mot de passe                                                 | NON PROUVÉ                | Une configuration locale expurgée existe ; projet distant, fournisseurs Auth et test réel restent non prouvés.                                                                                                             |
| Même `auth.users.id` pour même e-mail vérifié dans les deux ordres                           | NON PROUVÉ                | Capacité documentée par Supabase, mais aucun test réel Google→OTP et OTP→Google.                                                                                                                                           |
| Redirects exacts, domaines, PKCE SDK et scopes minimaux                                      | NON PROUVÉ                | Aucun environnement ni client Google.                                                                                                                                                                                      |
| SMTP production, limites, expiration et anti-énumération                                     | NON PROUVÉ                | Aucun SMTP ni preuve staging/production.                                                                                                                                                                                   |
| Prototype des trois intentions sans autorisation                                             | PARTIEL                   | `X-01` propose trois radios fermées couvertes par des tests structurels et E2E Chromium, sans présélection, stockage navigateur, rôle ni appel Auth/fournisseur ; la continuation serveur et `X-02..X-06` restent absents. |
| Callback Auth sans création de rôle/Agence/profil/bien/capacité                              | NON PROUVÉ                | Aucun callback ni test négatif.                                                                                                                                                                                            |
| MFA TOTP `aal2` et réauthentification Plateforme                                             | NON PROUVÉ                | Les drapeaux TOTP locaux existent ; aucun `X-06`, activation distante ou test de fraîcheur.                                                                                                                                |
| Absence de `Session`, `OtpChallenge`, `UserIdentity` maison                                  | VERT sur le corpus actuel | Le scan du squelette courant ne trouve aucune authentification maison.                                                                                                                                                     |
| Configuration expurgée, prototype `X-01..X-06`, tests d'e-mail et matrice intention→contexte | NON PROUVÉ                | Configuration locale et `X-01` sont partiels ; `X-02..X-06`, fournisseurs réels, tests d'e-mail et matrice intention→contexte restent absents.                                                                             |

Preuves officielles secondaires : [Identity Linking Supabase](https://supabase.com/docs/guides/auth/auth-identity-linking), [JWT Supabase](https://supabase.com/docs/guides/auth/jwts) et [templates OTP](https://supabase.com/docs/guides/auth/auth-email-templates). Elles justifient un POC, pas un statut vert.

Statut de tâche : **NON PROUVÉ**.

## S0-004 — Supabase Postgres, Data API et RLS — P0

Références : ROADMAP, l. 159–168 et 1006 ; STI, l. 440–534 et 1144–1171 ; PRD, l. 504–516 et 600–601.

| Critère                                                                                   | Statut     | Preuve attendue                                                                                                                  |
| ----------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Schémas `private`, `api`, `storage` et objets nécessaires                                 | NON PROUVÉ | Aucune migration Supabase.                                                                                                       |
| Exposer seulement `api`, fermeture par défaut                                             | NON PROUVÉ | `supabase/config.toml` expose seulement `api` localement ; aucun grant ni test Data API distant.                                 |
| Grants minimaux, `FORCE RLS`, politiques et allow/deny                                    | NON PROUVÉ | Aucune matrice SQL/pgTAP.                                                                                                        |
| Isolation inter-agences et intra-agence Locataire/Propriétaire                            | NON PROUVÉ | Aucun schéma ni test avec acteurs distincts.                                                                                     |
| JWT utilisateur pour commandes utilisateur ; `service_role` bornée                        | NON PROUVÉ | Le transport Worker→Supabase reste à décider et prouver.                                                                         |
| RPC atomiques `SECURITY DEFINER`, owner `NOLOGIN`, `search_path=''`, autorisation interne | NON PROUVÉ | Aucun prototype SQL.                                                                                                             |
| Migrations jetables, pgTAP et revue des privilèges                                        | PARTIEL    | Harnais GitHub et smoke pgTAP de plateforme prouvés par le run `33076539448` ; aucune migration Loya ni revue de privilèges/RLS. |

Statut de tâche : **NON PROUVÉ**.

## S0-005 — Ledger et visibilité Propriétaire — P0

Références : ROADMAP, l. 170–179 et 1007 ; PRD, l. 275–297 et 401–423 ; STI, l. 304–438.

| Critère                                                                  | Statut                                   | Preuve attendue                                           |
| ------------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------- |
| Formules principal, commission, net Propriétaire, plateforme, net Agence | VERT documentaire, NON PROUVÉ exécutable | Formules cohérentes dans PRD/STI ; aucun test de domaine. |
| XOF entiers et taux `0..10000` bps                                       | VERT documentaire, NON PROUVÉ exécutable | Aucun type/migration/contrainte.                          |
| Ledger double, immuable, équilibré, hors frais FedaPay                   | VERT documentaire, NON PROUVÉ exécutable | Nomenclature STI, l. 372–397 ; aucun test d'équilibre.    |
| Propriétaire et taux figés par échéance/item                             | VERT documentaire, NON PROUVÉ exécutable | Aucun snapshot persistant.                                |
| `OwnerRentAvailability` append-only sans balance/reversement             | VERT documentaire, NON PROUVÉ exécutable | Aucun modèle ou test de transition.                       |
| Point mensuel séparant attendu/encaissé/retard/disponible                | VERT documentaire, NON PROUVÉ exécutable | Aucun jeu de données ni projection.                       |
| Exemples, propriétés, `AC-006` et `AC-015`                               | NON PROUVÉ                               | Aucune suite financière.                                  |

Statut de tâche : **NON PROUVÉ**.

## S0-006 — Topologie Supabase + Cloudflare — P0

Références : ROADMAP, l. 181–191 et 1008 ; STI, l. 20–110, 926–971, 1221–1285.

| Critère                                                                    | Statut                | Preuve locale ou externe attendue                                                                                                                                              |
| -------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React/Vite PWA Static Assets + API Hono Worker                             | VERT local et externe | Build PWA reproductible, cycle de mise à jour multi-onglet, tests runtime Workers, smoke HTTP local et déploiement `loya-s0-topology-poc.morelhouanho.workers.dev` réussis.    |
| Supabase Auth/Postgres/Storage/Queues, CLI local, environnements séparés   | PARTIEL               | `supabase/config.toml`, reset PostgreSQL et pgTAP de plateforme sont prouvés en CI ; Auth, schéma métier, RLS, Storage, Queues et environnements distants restent non prouvés. |
| Queues : visibilité, ack, retry, DLQ, sweeper                              | NON PROUVÉ            | Supabase documente `pgmq`, `read`, `archive/delete` et visibilité ; aucune configuration/POC Loya.                                                                             |
| R2 privé comme journal de reprise pré-FedaPay                              | NON PROUVÉ            | Aucune enveloppe, clé, binding ou test de restauration.                                                                                                                        |
| Browser Run PDF + Storage privé                                            | NON PROUVÉ            | Capacités documentées, mais aucun POC de rendu/stockage.                                                                                                                       |
| Secrets, bindings, observabilité, régions, limites, coûts, responsabilités | PARTIEL               | Binding public `ENVIRONMENT`, logs applicatifs canonisés et manifeste expurgé prouvés ; secrets, régions, budgets et seuils restent ouverts.                                   |
| Absence Redis/BullMQ, D1, Fastify, serveur Node permanent                  | VERT                  | Scan du squelette et tests négatifs réussis ; le fichier de types Workers généré est exclu explicitement des faux positifs D1.                                                 |
| Manifestes, diagramme et POC Worker→Supabase/FedaPay                       | PARTIEL               | Manifestes, diagramme et POC Web/Worker présents ; Worker→Supabase/FedaPay reste bloqué par `OQ-002`, `OQ-009` et `OQ-010`.                                                    |

Preuves officielles secondaires : [Supabase Queues](https://supabase.com/docs/guides/queues), [Cloudflare R2 Bucket Locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/), [opérations conditionnelles R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) et [limites Browser Run](https://developers.cloudflare.com/browser-run/limits/). Elles confirment des briques disponibles, pas leur configuration ni leur adéquation aux volumes/RPO Loya.

Statut de tâche : **PARTIELLEMENT PROUVÉE** pour le socle React/Vite/Static Assets/Hono/Cloudflare. La tâche reste **NON TERMINÉE** tant que Supabase Auth/RLS/Queues, Storage, R2, Browser Run, FedaPay, régions, limites et coûts ne sont pas prouvés.

## S0-007 — Prototype UX mobile-first — P1

Références : ROADMAP, l. 193–202 et 1009 ; DESIGN, l. 459–556, 662–676 et 706–757.

| Critère                                                      | Statut     | Preuve ou écart                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prototyper `X-01..X-06`                                      | PARTIEL    | `X-01` est interactif et couvert par des tests structurels/E2E Chromium ; `X-02..X-06` et l’Auth réelle restent absents.                                                                                                  |
| Tester `L-01..L-05` à 320/360/390                            | ROUGE      | Maquette statique disponible, sans captures par largeur ni test. Les décisions `OQ-005..008` sont résolues par le choix A, mais la maquette n'est pas encore corrigée et aucune preuve visuelle/financière n'est fournie. |
| Prototyper `A-12` lot/correction/historique                  | ROUGE      | Aucun prototype. `OQ-004` est résolue par le choix A et transcrite dans le DESIGN (CTA long sur bandeau et confirmation), mais le prototype et les tests ne sont pas encore prouvés ici.                                  |
| Prototyper `O-01..O-04`                                      | NON PROUVÉ | Aucun prototype Propriétaire.                                                                                                                                                                                             |
| Vérifier l'absence de reversement dans l'espace Propriétaire | NON PROUVÉ | Aucun écran Propriétaire à inspecter.                                                                                                                                                                                     |
| Vérifier WCAG 2.2 AA, zoom/reflow, une action principale     | PARTIEL    | `X-01` prouve clavier, focus, cibles de 44 px et bascule responsive 599/600 px ; le prompt PWA conserve focus et saisie à 320 px ; lecteur d’écran, zoom 200 %, reflow 400 % et audit complet restent à produire.         |
| Captures, tests d'assistance et protocole de comparaison     | PARTIEL    | Les E2E Chromium `X-01` sont versionnés ; captures de référence, lecteur d’écran et protocole de comparaison restent absents.                                                                                             |

Statut de tâche : **ROUGE**.

## S0-008 — Vie privée, APDP et exploitation — P0

Références : ROADMAP, l. 204–213 et 1010 ; PRD, l. 584–618 et 620–632 ; STI, l. 1053–1082.

| Critère                                                                               | Statut                                     | Preuve attendue                                      |
| ------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Responsables, sous-traitants, hébergement, transferts, rétention, suppression, droits | NON PROUVÉ                                 | Registre absent.                                     |
| Documenter Supabase, Cloudflare, FedaPay, Google, SMTP, push                          | NON PROUVÉ                                 | Inventaire fournisseurs/DPA absent.                  |
| Minimisation de la vue Propriétaire                                                   | VERT documentaire, NON PROUVÉ exécutable   | DTO normatif défini ; aucune projection testable.    |
| Exclusion frais, total, plateforme et coordonnées privées                             | VERT documentaire, NON PROUVÉ exécutable   | Aucun test de contrat/audience.                      |
| Contact WhatsApp, remboursements externes et corrections                              | VERT documentaire, NON PROUVÉ opérationnel | Aucun runbook validé.                                |
| Conservation reçus, audits, inbox/outbox et disponibilité                             | NON PROUVÉ                                 | Durées et base légale absentes.                      |
| Registre, DPIA/décision, matrice de rétention, runbooks                               | NON PROUVÉ                                 | Livrables absents et décision locale signée requise. |

Statut de tâche : **NON PROUVÉ**.

## S0-009 — SLO, sauvegarde et reprise — P0

Références : ROADMAP, l. 215–224 et 1011 ; PRD, l. 57, 592 et 624–632 ; STI, l. 1084–1124 et 1255–1283.

| Critère                                                                         | Statut                                   | Preuve attendue                               |
| ------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| SLO, RPO, RTO chiffrés par parcours                                             | NON PROUVÉ                               | Aucun seuil versionné ou signé.               |
| Sauvegardes/PITR Supabase, rétention R2, configuration Cloudflare, restauration | NON PROUVÉ                               | Aucun environnement ni exercice.              |
| Enveloppe FedaPay authentifiée/chiffrée/versionnée pré-appel                    | NON PROUVÉ                               | Aucun schéma, binding ou POC.                 |
| Retrouver une transaction absente après restauration sans double effet          | NON PROUVÉ                               | Aucun test PITR + relecture marchand/fenêtre. |
| Reprise Queues, invisibilité expirée, DLQ, métriques, alertes                   | NON PROUVÉ                               | Aucun consumer/configuration/runbook.         |
| Disponibilité Propriétaire restaurée uniquement depuis l'historique métier      | VERT documentaire, NON PROUVÉ exécutable | Aucun jeu de restauration.                    |
| Configuration, test chronométré, rapport et runbook                             | NON PROUVÉ                               | Livrables absents.                            |

Statut de tâche : **NON PROUVÉ**.

## Conditions minimales pour réévaluer la porte

1. Fermer les questions encore ouvertes de [OPEN-QUESTIONS.md](../decisions/OPEN-QUESTIONS.md) qui affectent S0 et matérialiser/tester les décisions déjà résolues.
2. Attacher les rapports sandbox/configuration pour FedaPay, Supabase Auth/RLS/Queues et Cloudflare.
3. Fournir prototypes et tests `X`, `L`, `A-12`, `O`, puis corriger les conflits de maquette.
4. Fournir décisions APDP/rétention et seuils SLO/RPO/RTO, puis exécuter une restauration chronométrée.

Aucune de ces preuves ne peut être remplacée par une hypothèse de code ou par un état « vert » manuel.
