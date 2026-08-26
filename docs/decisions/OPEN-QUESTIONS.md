# Questions ouvertes bloquantes — Loya V1

Statut du registre : **OUVERT**. Date du constat : **2026-08-26**.

Ce registre ne crée aucune règle produit, financière, UX ou technique. Les seules sources normatives sont le [PRD](../../PRD_Gestion_Locative_IA_V1.md), le [STI](../../STI_Gestion_Locative_IA_V1.md), le [DESIGN](../../DESIGN_Gestion_Locative_IA_V1.md), la [ROADMAP](../../ROADMAP_Gestion_Locative_IA_V1.md) et la [maquette Locataire](../../maquette%20%C3%A9crans%20locataire.png). Le PRD interdit d'inventer une règle financière, un rôle ou un état et impose de bloquer puis documenter toute ambiguïté (PRD, l. 10–17).

Une question n'est close que par une décision explicite et traçable indiquant : l'option retenue ou sa formulation exacte, le décideur responsable, la date, les sources normatives à corriger le cas échéant et la preuve/test attendu. La fermeture du ticket ou une implémentation implicite ne vaut pas décision.

## Synthèse des décisions requises

| ID | Décision à obtenir | Bloque au minimum | Responsable de décision attendu |
|---|---|---|---|
| `OQ-001` | Sens de la frontière d'import `apps/*` / `packages/*` | `S0-001`, `S0-006`, `S1-001` | Architecture |
| `OQ-002` | Mécanisme Worker → SQL/RPC sous identité utilisateur | `S0-004`, `S1-004` | Architecture + sécurité |
| `OQ-003` | Correspondance entre échec de tentative et état de l'ordre | `S0-002`, `S3-003`, `S3-005` | Produit paiement + architecture |
| `OQ-004` | Libellé normatif du CTA `A-12` | `S0-007`, `S4-003` | Produit + Design |
| `OQ-005` | Sélection et total incohérents dans `L-04` | `S0-007`, `S3-001`, `S4-001` | Produit + Finance + Design |
| `OQ-006` | Ordre, devis, champs et libellés contradictoires de `L-04` | `S0-007`, `S3-001`, `S4-001` | Produit + Design |
| `OQ-007` | Liste des opérateurs Mobile Money de `L-04` | `S0-002`, `S0-007` | Produit paiement + Design |
| `OQ-008` | Libellés, contact et dates incohérents de `L-03` | `S0-007`, `S4-001` | Produit + Design |
| `OQ-009` | Issue si le contrat FedaPay ne prouve pas toutes les capacités | `GATE-0`, `S0-002` | Commanditaire + Paiement |
| `OQ-010` | Transaction outbox + Supabase Queues et identité d'appel | `S0-004`, `S0-006`, `S1-007` | Architecture + sécurité |
| `OQ-011` | Politique réelle de rollback des migrations | `S0-001`, `S1-003`, `S1-004` | Architecture + exploitation |
| `OQ-012` | Motifs et autorisations d'annulation d'une échéance | `S1-003`, `S2-005` | Produit + Finance |
| `OQ-013` | Instant exact de passage à `OVERDUE` | `S2-005`, `S4-004` | Produit + Finance |
| `OQ-014` | Valeurs de configuration non chiffrées | `GATE-0` puis chaque activation concernée | Sécurité + Exploitation + Produit |
| `OQ-015` | Durée de rétention, IAM et purge du journal R2 | `GATE-0`, premier appel FedaPay | Sécurité + Conformité + Exploitation |
| `OQ-016` | Preuve technique de fraîcheur MFA à cinq minutes | `S0-003`, `S1-005`, `S1-007` | Sécurité + Plateforme |
| `OQ-017` | Champs monétaires autorisant exactement zéro | `S0-005`, migrations financières | Produit + Finance |
| `OQ-018` | Calendrier, échéance et annulation des relevés plateforme | `S0-005`, `S3-008` | Produit + Finance + Exploitation |
| `OQ-019` | Configuration initiale des paiements manuels et preuves | `S2-001`, `S3-006` | Produit + Finance + Exploitation |
| `OQ-020` | Décisions signées APDP, régions et rétention | `GATE-0`, `S0-008` | Responsable conformité |
| `OQ-021` | Seuils signés SLO, RPO et RTO | `GATE-0`, `S0-009` | Produit + Exploitation |
| `OQ-022` | Mentions réglementaires des reçus | `GATE-0`, `S0-008`, `S4-001` | Finance + Conformité |

## Détail des questions

### `OQ-001` — Sens de la frontière d'import `apps/*` / `packages/*`

**Question.** La phrase « aucun import d'`apps/*` vers `packages/*` » ne permet pas de déterminer sans interprétation quelle couche peut importer l'autre, alors que le monorepo place les règles et adaptateurs partagés dans `packages/*` (STI, l. 53–73).

**Choix explicite à demander :**

- **A.** Les applications peuvent importer uniquement les points d'entrée publics des packages ; aucun package ne peut importer une application.
- **B.** Interdiction littérale de tout import d'une application vers un package ; préciser alors le mécanisme normatif d'assemblage des packages dans les applications.
- **C.** Publier un graphe d'import allowlisté, arête par arête, qui remplace l'interprétation directionnelle de cette phrase.

**Impact et clôture.** Sans décision, les alias TypeScript, règles ESLint, builds et tests de cycles ne peuvent pas être configurés de manière normative. Clôture par amendement STI ou ADR signé, puis test automatisé d'une arête autorisée, d'une arête interdite et d'un cycle.

### `OQ-002` — Worker → SQL/RPC sous identité utilisateur

**Question.** Le STI exige que les mutations passent par le Worker et des fonctions SQL contrôlées, tout en imposant que les commandes utilisateur appellent Supabase sous le même JWT afin que `auth.uid()` et la RLS restent actifs (STI, l. 44–50, 440–470 ; ROADMAP, l. 159–168 et 277–284). Le transport et la frontière transactionnelle exacts ne sont pas fixés.

**Choix explicite à demander :**

- **A.** Appel Data API/RPC avec clé publiable et JWT utilisateur propagé ; une RPC étroite réalise toute la transaction et contrôle `auth.uid()`.
- **B.** Connexion Postgres directe depuis le Worker avec un mécanisme documenté qui projette de façon fiable les claims vérifiés dans la transaction et maintient la RLS.
- **C.** Appel par `service_role` à une fonction bornée avec acteur dérivé par le Worker ; ce choix exige une modification normative explicite, car la RLS utilisateur ne resterait pas active comme l'exige le STI, l. 470.

**Impact et clôture.** Bloque les migrations, grants et commandes. Clôture par POC Worker → fonction SQL, trace de `auth.uid()`, tests allow/deny inter-agences et preuve qu'aucun secret serveur n'atteint le navigateur ou les logs.

### `OQ-003` — Retry : état de la tentative et état de l'ordre

**Question.** Une nouvelle génération de tentative est permise après une tentative terminale non approuvée, mais seulement si l'ordre reste `CREATED`. Par ailleurs, un échec fournisseur terminal fait passer un ordre non terminal à `FAILED`, après quoi un nouvel ordre est exigé (STI, l. 201–207, 416–429, 693–697 et 807–824). Il manque la table qui dit quels échecs terminent la tentative seule et lesquels terminent aussi l'ordre.

**Choix explicite à demander :**

- **A.** Tout échec terminal d'une tentative termine aussi l'ordre ; le retry utilisateur crée toujours un nouvel ordre/devis.
- **B.** Seuls les échecs techniques prouvés avant acceptation fournisseur laissent l'ordre `CREATED`; un échec terminal fournisseur termine l'ordre.
- **C.** Une allowlist de résultats fournisseur laisse l'ordre `CREATED` et autorise une génération supérieure ; tous les autres résultats terminent l'ordre.

**Impact et clôture.** Bloque la machine d'état, la libération des réservations, le polling et l'idempotence. Clôture par table exhaustive `attempt terminal → order state → reservation state → action utilisateur`, codes d'erreur stables et tests de concurrence/timeout/lookup.

### `OQ-004` — CTA contradictoire de `A-12`

**Question.** `AvailabilityBatchBar` impose **« DÉCLARER DISPONIBLE AUPRÈS DE L'AGENCE »**, tandis que l'écran `A-12` impose **« DÉCLARER LA DISPONIBILITÉ »** et la confirmation utilise encore une casse/formulation distincte (DESIGN, l. 447–457, 662–676 et 846–850). Les textes entre guillemets sont normatifs (DESIGN, l. 10–19).

**Choix explicite à demander :**

- **A.** Utiliser la formulation longue sur le bandeau et dans la confirmation.
- **B.** Utiliser la formulation courte sur le bandeau et dans la confirmation.
- **C.** Conserver deux libellés selon la surface et publier la correspondance exacte composant → confirmation.

**Impact et clôture.** Bloque la validation visuelle et les assertions E2E. Clôture par correction du DESIGN et capture/tests du texte retenu.

### `OQ-005` — Sélection et total incohérents dans la maquette `L-04`

**Question.** Dans la maquette, les deux loyers visiblement cochés valent 450 000 et 300 000 FCFA, soit 750 000 FCFA, alors que le sous-total et le total affichent 1 350 000 FCFA ; le loyer de 600 000 FCFA paraît non coché. Or les montants affichés doivent provenir exactement de la sélection et du devis serveur (DESIGN, l. 504–523 ; STI, l. 664–697).

**Choix explicite à demander :**

- **A.** Cocher aussi la ligne de 600 000 FCFA et conserver le total de 1 350 000 FCFA.
- **B.** Conserver deux lignes cochées et corriger sous-total/total à 750 000 FCFA, frais valides en sus.
- **C.** Remplacer le jeu de données par un autre exemple dont sélection, sous-total, frais et total sont arithmétiquement cohérents.

**Impact et clôture.** Bloque la maquette de référence et les fixtures visuelles/financières. Clôture par maquette corrigée, fixture versionnée et assertion `principal + frais = total`.

### `OQ-006` — Ordre, devis, champs et libellés contradictoires de `L-04`

**Question.** La maquette place le récapitulatif avant le moyen de paiement, présélectionne Mobile Money, affiche « Frais de service — 0 FCFA », omet le champ « Numéro Mobile Money » et écrit « Paiement 100% sécurisé ». Le DESIGN impose dans l'ordre méthode, numéro Mobile Money, puis devis serveur ; aucune présélection initiale, jamais `0 FCFA` sans devis valide, libellés « Frais FedaPay » et « Paiement sécurisé » (DESIGN, l. 504–523).

**Choix explicite à demander :**

- **A.** Corriger la maquette et implémenter strictement l'ordre, les champs et libellés du DESIGN.
- **B.** Retenir la structure de la maquette et amender explicitement le DESIGN et les règles de devis concernées.
- **C.** Publier une matrice élément par élément indiquant ce qui suit le DESIGN et ce qui suit la maquette, puis corriger les deux sources pour qu'elles convergent.

**Impact et clôture.** Bloque `L-04`, l'accessibilité du formulaire et la prévention d'un faux total. Clôture par source normative convergente, captures 320/360/390 px et tests état initial → devis valide → invalidation/recalcul.

### `OQ-007` — Opérateurs Mobile Money de `L-04`

**Question.** Le DESIGN cite MTN MoMo, Moov Money et Celtiis Cash. La maquette cite MTN MoMo, Moov Money et Orange Money (DESIGN, l. 512–519 ; constat visuel de la maquette).

**Choix explicite à demander :**

- **A.** Remplacer Orange Money par Celtiis Cash dans la maquette.
- **B.** Ajouter formellement Orange Money aux opérateurs validés en conservant les opérateurs obligatoires du DESIGN.
- **C.** Rendre la liste exclusivement issue des canaux actifs prouvés par le contrat FedaPay et amender le DESIGN pour préciser si sa liste est minimale ou exhaustive.

**Impact et clôture.** Bloque les libellés UI et les tests de contrat canal/opérateur. Clôture par liste signée, mapping fournisseur/environnement et test de projection.

### `OQ-008` — Incohérences de `L-03`

**Question.** La maquette utilise « Informations du bail », « Agence / Propriétaire » et un CTA téléphone ; elle montre aussi une fin de location au 31 décembre 2024 avec un prochain loyer au 5 juin 2025. Le DESIGN exige « Informations de location », la carte « Votre agence », un CTA WhatsApp et aucun contact direct propriétaire ; il précise que la projection n'est pas un bail numérique (DESIGN, l. 490–502).

**Choix explicite à demander :**

- **A.** Corriger libellés, CTA et dates de la maquette selon le DESIGN.
- **B.** Retenir les éléments de la maquette et amender explicitement le DESIGN/PRD, sans introduire le bail juridique exclu.
- **C.** Déclarer séparément les valeurs de démonstration non normatives et les composants/textes normatifs, puis fournir une fixture temporellement cohérente.

**Impact et clôture.** Bloque la validation de `L-03` et risque de suggérer un contrat ou un contact propriétaire hors périmètre. Clôture par maquette corrigée et tests de contenu/WhatsApp/date d'affectation.

### `OQ-009` — Issue contractuelle FedaPay

**Question.** Signature, frais figés avant débit, idempotence, états, relecture par compte marchand/fenêtre et double débit doivent être prouvés ; le paiement en ligne reste interdit si le devis ou l'idempotence requis ne sont pas garantis (PRD, l. 620–632 ; STI, l. 760–789 ; ROADMAP, l. 126–144 et 229).

**Choix explicite à demander après le spike :**

- **A.** Le contrat et la sandbox prouvent toutes les capacités : autoriser l'adaptateur conforme avec les mappings/versionnements prouvés.
- **B.** Une capacité manque : conserver le paiement en ligne désactivé et livrer seulement les parcours autorisés indépendants de FedaPay.
- **C.** Demander au commanditaire une modification formelle du fournisseur, du périmètre ou des règles ; aucun changement de socle ne peut être implicite.

**Impact et clôture.** `GATE-0` reste rouge tant que le choix ne repose pas sur documentation officielle, fixtures expurgées, sandbox et tests de contrat/concurrence/reprise.

### `OQ-010` — Atomicité outbox + Supabase Queues

**Question.** La mutation métier doit insérer l'outbox et appeler `pgmq.send` dans la même transaction, tandis que les files techniques ne sont pas exposées à la Data API et que les commandes utilisateur doivent conserver leur JWT (STI, l. 470–480 et 955–971 ; ROADMAP, l. 321–331 et 884). La primitive SQL et ses droits ne sont pas précisés.

**Choix explicite à demander :**

- **A.** Une RPC métier appelée sous JWT utilisateur effectue mutation, outbox et `pgmq.send`; des RPC techniques séparées et bornées couvrent webhook/cron.
- **B.** Une transaction Postgres directe du Worker effectue les trois opérations avec identité/claims prouvés et rôles SQL distincts.
- **C.** Une fonction privilégiée commune publie en queue ; définir alors séparément son appel utilisateur et technique, ses grants et la façon dont elle respecte les contraintes de `OQ-002`.

**Impact et clôture.** Bloque les RPC, grants et workers asynchrones. Clôture par migration, revue de privilèges et tests crash avant/après commit, double livraison, lease expirée, DLQ et sweeper.

### `OQ-011` — Rollback des migrations

**Question.** La ROADMAP demande des « migrations up/down », tandis que le STI impose expansion–contraction, compatibilité N/N−1 et correction avant/arrière pour une migration irréversible (ROADMAP, l. 266–275 ; STI, l. 1240–1247). La politique de production n'est pas explicitée.

**Choix explicite à demander :**

- **A.** Chaque migration réversible possède un script `down`; l'irréversible possède sauvegarde et migration compensatrice.
- **B.** Aucun `down` en production ; rollback applicatif N−1 et migrations correctives uniquement, avec `down` limité au local/CI.
- **C.** Politique hybride par classe de migration, documentée dans une matrice obligatoire avant merge.

**Impact et clôture.** Bloque la convention de migrations et les critères de PR. Clôture par runbook, exemple réversible, exemple irréversible et test N/N−1.

### `OQ-012` — Annulation d'une échéance

**Question.** `PENDING → CANCELLED` exige un motif autorisé et `OVERDUE → CANCELLED` une règle explicite, sans que la liste des motifs, les rôles ou la commande soient définis (STI, l. 401–414 ; PRD, l. 447–454).

**Choix explicite à demander :**

- **A.** Annulation uniquement par une commande Agence autorisée, avec allowlist de motifs distincte pour `PENDING` et `OVERDUE`.
- **B.** Annulation uniquement par des événements système explicitement listés ; aucun CTA utilisateur V1.
- **C.** Autoriser certaines causes système et certaines causes Agence, avec matrice rôle × état × motif.

**Impact et clôture.** Bloque les contraintes et transitions d'échéance. Clôture par matrice signée, API fermée, audit et tests exhaustifs ; `OVERDUE → CANCELLED` doit rester impossible tant que sa règle n'est pas décidée.

### `OQ-013` — Instant exact de passage à `OVERDUE`

**Question.** Le passage intervient « après `dueDate + graceDays` », mais l'instant, le fuseau et l'inclusivité du dernier jour ne sont pas définis (STI, l. 651–653 et 1030–1036 ; PRD, l. 207).

**Choix explicite à demander :**

- **A.** Début du jour civil suivant la somme, dans le fuseau IANA de l'Agence.
- **B.** Fin du jour civil correspondant à la somme, dans le fuseau IANA de l'Agence.
- **C.** Persister un `overdue_at` calculé à l'émission selon une convention de calendrier explicitement documentée.

**Impact et clôture.** Bloque le job, les agrégats et notifications. Clôture par règle avec exemples `graceDays=0`, fin de mois et changement de fuseau, plus tests d'horloge déterministes.

### `OQ-014` — Valeurs de configuration non chiffrées

**Question.** Plusieurs durées/limites sont obligatoires mais non chiffrées : intentions et invitations, élévation opérateur, devis/ordres/réservations, rétention du numéro Mobile Money, URL signée, files (visibility timeout, batch, essais, délais, archive), preuves (taille/MIME), relances et horizons. Le STI impose que toute valeur dépendante d'un environnement ou fournisseur soit explicite, testée et reliée à une porte (STI, l. 10–18, 160–206, 629–653, 948–971).

**Choix explicite à demander :**

- **A.** Une matrice unique signée fixe valeurs production, limites et seules dérogations non-production.
- **B.** Des matrices séparées sécurité, paiement, asynchrone et fichiers sont signées par leurs responsables puis agrégées à la porte.
- **C.** Toute capacité sans valeur approuvée reste désactivée ; les valeurs arrivent au fil des décisions sans valeur provisoire inventée.

**Impact et clôture.** Bloque les schémas de configuration et tests de limite. Clôture par valeurs exactes, unités, portée, bornes, propriétaire et tests par environnement.

### `OQ-015` — Rétention, IAM et purge du journal R2

**Question.** L'enveloppe R2 doit être conditionnelle, chiffrée, verrouillée pendant la fenêtre financière, relue avant appel et purgée légalement, mais la durée, le mode de calcul, les rôles IAM et la procédure de purge ne sont pas fixés (STI, l. 49, 238–240, 815 et 1255–1281 ; ROADMAP, l. 215–224).

**Choix explicite à demander :**

- **A.** Durée fixe à compter de la création, approuvée par Finance/Conformité.
- **B.** Date `retain-until` calculée depuis RPO, fenêtre de relecture et matrice légale approuvés.
- **C.** Politique différenciée par environnement ou classe d'objet, avec une règle de purge explicite pour chaque classe.

**Impact et clôture.** Bloque le premier appel de création FedaPay. Clôture par décision de rétention, matrice IAM, configuration expurgée et test création conditionnelle/ETag/verrou/refus de suppression/purge autorisée.

### `OQ-016` — Fraîcheur MFA de cinq minutes

**Question.** Les mutations Plateforme sensibles exigent un JWT `aal2` et une preuve TOTP de moins de cinq minutes ; le STI évoque les claims/AMR sans fixer la claim et la source temporelle effectivement disponibles dans Supabase (PRD, l. 367 ; STI, l. 468 et 564–570).

**Choix explicite à demander après POC officiel :**

- **A.** Utiliser l'horodatage AMR officiel s'il est présent, signé et prouvé dans le JWT.
- **B.** Forcer un nouveau challenge TOTP officiel à l'expiration puis utiliser le nouveau JWT `aal2`.
- **C.** Lier une élévation serveur temporaire à un challenge officiel récent ; préciser comment ce mécanisme évite de devenir un second système d'authentification.

**Impact et clôture.** Bloque les mutations Super Admin. Clôture par POC, claims expurgés, test à 4 min 59 s/5 min/5 min 01 s et refus `aal1`, sans table OTP ou preuve maison.

### `OQ-017` — Champs monétaires autorisant zéro

**Question.** Le STI impose des montants « positifs ou nuls selon le champ » sans donner la matrice complète ; il autorise explicitement certains zéros et impose `PlatformCommissionSettlement.amount_xof > 0` (STI, l. 276–289 et 304–315). Le comportement d'un loyer principal nul n'est pas défini.

**Choix explicite à demander :**

- **A.** `rent_amount_xof` et principal payable strictement positifs ; frais, commissions et résultats dérivés peuvent être nuls lorsque leurs formules le permettent.
- **B.** Autoriser une échéance de loyer nulle et définir son cycle complet, notamment paiement, reçu, ledger et disponibilité.
- **C.** Autoriser une affectation à loyer nul mais ne pas émettre d'échéance payable ; définir sa projection séparément.

**Impact et clôture.** Bloque les `CHECK`, types de domaine et propriétés comptables. Clôture par matrice champ → `> 0`, `>= 0` ou signé, puis tests de bord pour chaque champ.

### `OQ-018` — Cycle des relevés plateforme

**Question.** Les relevés sont périodiques, ont `period_start`, `period_end`, `due_at` et les états `DUE/OVERDUE/PAID/CREDIT/CANCELLED`, mais cadence, jour d'émission, échéance, instant de retard et règle d'annulation ne sont pas définis (PRD, l. 297 et 414–420 ; STI, l. 219–220, 277–288, 362–370 et 431–435).

**Choix explicite à demander :**

- **A.** Cycle mensuel civil par fuseau Agence, avec délai d'échéance et règle d'annulation à fournir.
- **B.** Cycle mensuel unique de plateforme en UTC, avec délai d'échéance et règle d'annulation à fournir.
- **C.** Calendrier d'exploitation configurable mais versionné, borné et sans chevauchement.

**Impact et clôture.** Bloque génération, jobs, notifications et règlement. Clôture par calendrier exact, cas de crédit/ajustement, matrice de transitions et tests de concurrence.

### `OQ-019` — Politique initiale des paiements manuels

**Question.** Un paiement manuel exige mode et politique de référence/preuve, avec modes `CASH`, `BANK_TRANSFER`, `EXTERNAL_MOBILE_MONEY`, `OTHER`. La ROADMAP place cette politique dans l'onboarding, mais la matrice technique des six étapes `A-01` ne contient aucun champ correspondant (STI, l. 648–658, 699–701 et 887–908 ; ROADMAP, l. 368–385 et 528–535).

**Choix explicite à demander :**

- **A.** Ajouter modes et matrice référence/preuve à une étape précise de `A-01` et amender STI/DESIGN.
- **B.** Activer une politique système initiale explicitement signée, modifiable ensuite dans `A-17`.
- **C.** Activer l'Agence mais désactiver la confirmation manuelle jusqu'à configuration explicite dans `A-17`.

Pour chaque mode, la décision doit aussi préciser référence obligatoire/facultative/interdite, preuve obligatoire/facultative/interdite, libellé `OTHER`, formats et contrôle de fichier.

**Impact et clôture.** Bloque onboarding, activation sûre et endpoint manuel. Clôture par matrice de politique, source de valeur initiale, permissions, migrations et tests par mode.

### `OQ-020` — APDP, régions, transferts et rétention

**Question.** Responsables, sous-traitants, bases légales, régions, transferts, droits, suppression et durées doivent recevoir une décision signée ; l'ingénierie ne peut pas les déduire des documents (PRD, l. 620–632 ; ROADMAP, l. 204–213, 218 et 235).

**Choix explicite à demander :**

- **A.** Approuver une matrice complète de traitement/rétention et les régions proposées.
- **B.** Exiger une DPIA avant décision finale et maintenir les traitements concernés désactivés.
- **C.** Réduire formellement les données ou fournisseurs concernés puis réviser les quatre documents avant activation.

**Impact et clôture.** `GATE-0` reste rouge. Clôture uniquement par registre, DPIA ou décision motivée, matrice de rétention/suppression, régions et responsables signés.

### `OQ-021` — SLO, RPO et RTO

**Question.** Les seuils doivent être chiffrés par parcours, mais aucun chiffre ne peut être inventé (PRD, l. 624–632 ; ROADMAP, l. 215–224 et 235).

**Choix explicite à demander :**

- **A.** Seuils distincts par parcours critique : Auth, lecture, commande, paiement, reçu, notification et restauration.
- **B.** Classes de service partagées, avec chaque parcours affecté à une classe et un budget d'erreur.
- **C.** Phase pilote avec seuils provisoires explicitement approuvés, date de revue et activation production bloquée jusqu'à validation.

**Impact et clôture.** Bloque dimensionnement, alertes, rétention R2 et décision de reprise. Clôture par matrice chiffrée, méthode de mesure, fenêtres, alertes et exercice chronométré signé.

### `OQ-022` — Mentions réglementaires des reçus

**Question.** Les modèles et mentions réglementaires doivent être validés localement ; aucune formulation ne peut être inventée (PRD, l. 624–626 ; STI, l. 930–944).

**Choix explicite à demander :**

- **A.** Valider un modèle distinct `TENANT/FEDAPAY`, `TENANT/MANUAL` et, s'il est retenu, `AGENCY_INTERNAL`.
- **B.** Valider un socle commun et des sections conditionnelles par audience/source.
- **C.** Reporter le modèle interne facultatif et ne valider que les reçus Locataire obligatoires pour la V1.

**Impact et clôture.** Bloque le rendu PDF définitif et la conformité des reçus. Clôture par modèles signés, champs obligatoires, numérotation, durée de conservation et fixtures PDF vérifiées.

## Règle de reprise

Tant qu'une question reste ouverte, l'équipe peut produire un spike ou un double de test, mais ne doit pas faire passer la dépendance concernée au vert ni cacher un choix dans le code. Toute nouvelle contradiction découverte est ajoutée ici avant implémentation, conformément au PRD, l. 15–17, et aux preuves exigées par la ROADMAP, l. 109–124 et 226–235.
