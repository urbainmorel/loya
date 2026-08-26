# PRD — Gestion Locative IA V1

> Spécification produit autonome destinée à Codex
>
> - Produit ciblé : **Loya V1**
> - Portée : besoin métier, périmètre, règles et critères d’acceptation complets
> - Ensemble d’implémentation courant : [STI](./STI_Gestion_Locative_IA_V1.md), [DESIGN](./DESIGN_Gestion_Locative_IA_V1.md) et [ROADMAP](./ROADMAP_Gestion_Locative_IA_V1.md)
> - Statut : **normatif et prêt pour implémentation**

## 0. Contrat d’exécution pour Codex

1. Lire ce fichier en entier avant de modifier le code.
2. Considérer les décisions marquées **VERROUILLÉ** comme non négociables.
3. Utiliser les identifiants `FR-*`, `BR-*` et `NFR-*` dans les issues, tests, migrations et pull requests.
4. Dans l’ensemble d’implémentation courant, ce PRD fait autorité sur le besoin métier et le périmètre ; le STI sur l’architecture et la sécurité ; le DESIGN sur l’interface et les interactions ; la ROADMAP sur l’ordre d’exécution et les portes de qualité.
5. Ne jamais inventer une règle financière, un rôle ou un état. Bloquer l’implémentation et documenter la question si une ambiguïté subsiste.
6. Une fonctionnalité n’est terminée que si ses critères d’acceptation, tests, contrôles d’autorisation, états UI et traces d’audit sont couverts.

## 1. Résumé produit

Gestion Locative IA V1 est une PWA SaaS mobile-first de gestion des loyers pour les agences immobilières, leurs locataires et leurs propriétaires. Elle couvre le cycle opérationnel minimal : référentiels, affectations locatives, échéances, paiement de loyers entiers, reçus, comptabilisation, commissions, visibilité propriétaire et notifications. Elle ne gère aucun reversement de fonds entre une Agence et un Propriétaire.

Le produit fournit quatre contextes isolés :

- **Agence** : paramétrer et piloter la gestion locative courante.
- **Locataire** : retrouver tous ses logements, payer un ou plusieurs loyers entiers d’une même agence et télécharger ses reçus dans l’interface **Loya**.
- **Propriétaire** : consulter ses biens, leur occupation, les loyers attendus/payés/en retard, la commission Agence, le net mensuel et la disponibilité déclarée auprès de l’Agence.
- **Super Admin** : administrer la plateforme et la commission plateforme sans accès général aux données métier des agences.

Le terme « IA » du nom ne crée **aucune fonctionnalité d’intelligence artificielle visible par l’utilisateur en V1**. L’IA sert uniquement à assister la conception, le développement, les tests et la documentation.

## 2. Problème et proposition de valeur

### 2.1 Problème

Les agences ont besoin d’une vision fiable des loyers dus et payés, sans confondre le loyer avec les frais du prestataire de paiement. Les locataires ont besoin d’un paiement simple sur mobile et d’une preuve immédiate. Les propriétaires ont besoin d’une lecture transparente de l’occupation, des impayés, du loyer collecté, de la commission Agence, du net mensuel et de la disponibilité indiquée par l’Agence, sans imposer à Loya de gérer la remise des fonds.

### 2.2 Proposition de valeur

- Une échéance financière unique, traçable et indivisible par mois.
- Une confirmation de paiement fondée sur un événement FedaPay authentifié ou une validation manuelle autorisée.
- Une séparation explicite entre loyer, frais FedaPay, commission agence, commission plateforme et net propriétaire.
- Un espace Propriétaire en lecture seule avec point mensuel et contact WhatsApp, sans workflow de reversement.
- Une expérience excellente dès 320–360 px et une interface Agence réellement responsive jusqu’au desktop.
- Un registre financier, des reçus et des notifications cohérents avec chaque opération.

## 3. Objectifs et indicateurs V1

| ID | Objectif | Indicateur de validation |
|---|---|---|
| `OBJ-001` | Encaisser sans ambiguïté | 100 % des paiements confirmés rattachés à une ou plusieurs échéances entières |
| `OBJ-002` | Informer rapidement | notification Agence et Locataire créée après confirmation du loyer, indépendamment du statut manuel de disponibilité Propriétaire |
| `OBJ-003` | Fiabiliser les montants | aucune vue Agence ne comptabilise les frais FedaPay comme loyer |
| `OBJ-004` | Donner de la transparence au propriétaire | chaque bien expose son occupation et chaque période expose l’attendu, le payé/en retard, la commission Agence, le net Propriétaire et la disponibilité déclarée par l’Agence |
| `OBJ-005` | Réussir sur mobile | aucun parcours essentiel bloqué ou en défilement horizontal aux largeurs de test |
| `OBJ-006` | Protéger les agences | aucune lecture ou écriture inter-agence dans les tests RLS et d’autorisation |
| `OBJ-007` | Assurer l’exploitation | sauvegarde, restauration testée, observabilité et procédures d’incident disponibles avant le pilote |
| `OBJ-008` | Rendre le paiement mobile efficace | médiane inférieure à deux minutes entre l’ouverture de l’écran « Payer mes loyers » (`L-04`) et la remise à FedaPay, latence fournisseur exclue, lors d’un test avec au moins cinq locataires représentatifs |
| `OBJ-009` | Simplifier l’accès | l’accueil propose trois portes explicites Agence/Locataire/Propriétaire vers une authentification Supabase unique ; un nouvel utilisateur peut ouvrir une session par une seule action « Continuer avec Google », hors éventuel choix de compte ou consentement Google |

Les cibles quantitatives définitives d’adoption, de taux de paiement et de performance technique seront fixées pendant le pilote à partir d’une mesure initiale. Les cibles d’utilisabilité de `OBJ-008` et de simplicité d’accès de `OBJ-009` restent normatives ; Codex ne doit pas inventer d’autre KPI commercial.

## 4. Utilisateurs, contextes et rôles

### 4.1 Contextes

| Contexte | Besoin principal | Règle UX |
|---|---|---|
| Agence | gérer échéances et encaissements | complet mais simple, cartes sur mobile, tableaux utiles sur desktop |
| Locataire | gérer plusieurs logements, payer et obtenir une preuve | interface Loya raffinée et sobre, action principale « PAYER MES LOYERS », vocabulaire non technique |
| Propriétaire | suivre occupation, loyers et disponibilité déclarée | lecture seule synthétique, transparence financière, contact WhatsApp, aucun CSV ni reversement géré |
| Super Admin | administrer la plateforme | administration sobre, données minimales, accès exceptionnel audité |

### 4.2 Rôles Agence

| Capacité | ADMIN | GESTIONNAIRE | COMPTABLE | LECTEUR |
|---|:---:|:---:|:---:|:---:|
| Paramètres agence et membres | Oui | Non | Non | Non |
| Invitations de membres Agence | Oui | Non | Non | Non |
| Invitations Locataire/Propriétaire | Oui | Oui | Non | Non |
| Référentiels et affectations | Oui | Oui | Lecture | Lecture |
| Génération/gestion des échéances | Oui | Oui | Oui | Lecture |
| Validation d’un paiement manuel | Oui | Non | Oui | Non |
| Enregistrement d’un remboursement externe intégral | Oui | Non | Oui | Non |
| Consultation financière | Oui | Oui | Oui | Oui |
| Déclaration de disponibilité d’un loyer auprès de l’Agence | Oui | Non | Oui | Non |
| Export CSV Agence | Oui | Non | Oui | Non |

La matrice finale doit être implémentée par permissions côté serveur. Le libellé d’un rôle n’autorise jamais à lui seul une opération sensible.

Toute Agence `DRAFT`, `ACTIVE` ou `SUSPENDED` conserve au moins un membre `ADMIN` actif. La création du brouillon établit le premier ADMIN ; la révocation, la désactivation ou la rétrogradation du dernier ADMIN actif est refusée atomiquement, y compris lorsque deux changements concurrents tenteraient d’orpheliner l’Agence. Une invitation ADMIN en attente ne compte pas comme administrateur actif.

### 4.3 Principes d’identité

- L’identité globale est le `auth.users.id` attribué par Supabase Auth.
- Supabase Auth fournit l’OTP e-mail, Google OAuth et la liaison automatique standard des identités partageant la même adresse e-mail vérifiée ; une méthode d’authentification ne crée jamais un rôle métier.
- Un même utilisateur peut appartenir à plusieurs agences et contextes.
- Un `TenantProfile` est propre à une agence et peut exister avant l’acceptation de l’invitation.
- Un `Owner` est propre à une agence ; un ou plusieurs utilisateurs peuvent lui être rattachés.
- Toute sélection d’agence active doit être explicite et contrôlée côté serveur.

## 5. Périmètre strict

### 5.1 Inclus en V1

- Trois portes d’accès « Agence », « Locataire » et « Propriétaire » vers une authentification Supabase unique sans mot de passe, par OTP envoyé uniquement par e-mail ou par « Continuer avec Google », avec invitations sécurisées et rattachements métier séparés.
- Paramètres Agence, membres et rôles.
- Propriétaires, biens, unités, profils locataires et affectations locatives.
- Politiques d’échéance et génération d’échéances.
- Paiement FedaPay d’un ou plusieurs loyers entiers, y compris plusieurs logements de la même agence et plusieurs mois consécutifs par logement.
- Moyens Locataire FedaPay : Mobile Money béninois et carte bancaire via interface sécurisée du prestataire, sous réserve d’une validation fournisseur préalable à l’activation du canal concerné.
- Paiement en espèces ou reçu hors application, enregistré et validé par l’Agence.
- Reçus locataires téléchargeables.
- Ledger, rapprochement, commission agence, net propriétaire et commission plateforme.
- Consultation Propriétaire en lecture seule : occupation, échéances, impayés, point mensuel, commission Agence, net Propriétaire et disponibilité déclarée manuellement par l’Agence.
- Relevés de commission plateforme et enregistrement de leur règlement.
- Tableaux de bord essentiels, notifications, exports Agence autorisés.
- Contact direct de l’Agence via WhatsApp.
- PWA mobile-first et responsive pour les quatre contextes.

### 5.2 Exclus de V1 — **VERROUILLÉ**

- Tout paiement partiel, solde restant, fractionnement ou échéancier de paiement.
- Contrats et génération de contrats.
- États des lieux.
- Maintenance.
- Signalement de problème ou ticket de support interne.
- Rapports avancés et BI.
- Import de données, y compris « import simple ».
- Export CSV pour le propriétaire.
- Remboursement initié ou exécuté depuis l’application.
- Consultation du solde global, des balances ou des retraits du compte/sous-compte FedaPay.
- Déclaration, preuve, confirmation, historique ou exécution d’un reversement de l’Agence au Propriétaire.
- Détention ou cantonnement du loyer locataire par la plateforme.
- Fonctionnalité d’IA visible par l’utilisateur.
- Application native iOS ou Android distincte de la PWA.
- Mot de passe local, OTP par téléphone, authentification par SMS ou par WhatsApp.

Toute demande touchant ces exclusions passe par un changement formel de périmètre et ne doit pas être ajoutée opportunément par Codex.

## 6. Exigences fonctionnelles

### 6.1 Authentification et invitations

#### `FR-001` — Authentification

Le système utilise Supabase Auth pour authentifier tout utilisateur sans mot de passe, soit par un code OTP envoyé uniquement à une adresse e-mail, soit par « Continuer avec Google ». L’OTP e-mail constitue la voie universelle et reste visible dans le panneau d’accès commun ; Google offre la création/connexion rapide pour les trois intentions Agence, Locataire et Propriétaire. L’OTP est court, temporaire, à usage unique, limité en fréquence et protégé contre l’énumération de comptes. La liaison automatique standard de Supabase fusionne sous un même `auth.users.id` les identités Google et e-mail qui partagent la même adresse vérifiée ; aucune liaison n’est réalisée à partir d’une adresse non vérifiée. Le téléphone n’est jamais un identifiant de connexion et aucun OTP n’est envoyé par SMS ou WhatsApp en V1.

#### `FR-002` — Invitation Agence

L’Agence peut inviter par e-mail un membre, un locataire ou un accès propriétaire. Seul l’ADMIN émet ou révoque une invitation membre et choisit son rôle ; l’ADMIN ou le GESTIONNAIRE peut gérer une invitation Locataire/Propriétaire dans son périmètre de référentiels. L’invitation possède un jeton à usage unique, une expiration, un statut, une adresse destinataire normalisée, une agence d’origine et une cible immuable : rôle Agence, profil Locataire ou propriétaire. Après preuve de cette adresse par OTP e-mail ou par une identité Google admissible, l’utilisateur doit accepter explicitement l’invitation ; le serveur rattache alors atomiquement l’utilisateur existant ou nouvellement vérifié à cette cible exacte. Une connexion Google seule n’accepte aucune invitation et ne crée aucun droit. Si l’Agence est `SUSPENDED`, l’aperçu reste consultable mais l’acceptation est temporairement bloquée sans consommer l’invitation ; elle peut reprendre après réactivation tant que l’invitation reste valide.

#### `FR-003` — Multi-agence

Un utilisateur rattaché à plusieurs agences choisit son contexte actif. Aucun identifiant fourni par le client ne peut remplacer le contexte autorisé dérivé de la session. Par exception UX, le portefeuille Locataire peut agréger en lecture les logements autorisés dans le tableau de bord Locataire (`L-01`) et « Mes logements » (`L-02`), présenter dans « Payer mes loyers » (`L-04`) des groupes d’Agences distincts et afficher dans « Paiements » (`L-05`) l’historique autorisé multi-agence. Chaque groupe, devis, ordre, tentative et charge reste strictement limité à une seule Agence, un seul profil locataire et un seul compte marchand ; changer de groupe ne transporte ni sélection ni devis. Le contexte Propriétaire demeure mono-agence : une identité possédant des accès Propriétaire dans plusieurs Agences choisit l’une d’elles dans le sélecteur « Changer d’espace » (`X-04`) ; aucun agrégat, point mensuel ou disponibilité ne mélange plusieurs Agences.

#### `FR-004` — Accès rapide avec Google

Le bouton « Continuer avec Google » est disponible dans le panneau commun ouvert depuis chacune des trois portes d’accès. Pour un nouvel utilisateur, une seule action dans Loya — hors choix de compte ou consentement contrôlé par Google — crée l’identité Supabase globale et ouvre la session, sans formulaire préalable. Supabase Auth réalise le flux OAuth avec les portées minimales nécessaires et expose à l’application un `auth.users.id` stable comme identifiant canonique.

Avec une intention Locataire ou Propriétaire, l’utilisateur est ensuite dirigé vers l’invitation en cours portée par une continuation valide ; sans invitation ni accès existant, il voit un état explicatif indiquant que son Agence doit l’inviter. Avec une intention Agence, un membre existant ouvre son contexte autorisé et un utilisateur sans accès peut choisir explicitement « Créer une Agence » puis poursuivre le parcours « Créer mon espace Agence » (`A-01`) décrit par `FR-010`. Aucun profil, bien, rôle ou Agence n’est inventé à partir de l’identité. Une même identité Supabase authentifie tous les contextes autorisés de l’utilisateur.

Lorsque Google et l’OTP utilisent la même adresse vérifiée, la liaison automatique standard de Supabase doit converger vers le même `auth.users.id`. Les conflits que Supabase refuse ne sont jamais contournés par une fusion applicative artisanale : l’utilisateur revient à l’OTP de l’adresse attendue ou passe par une résolution opérateur auditée. Une invitation reste attachée à son destinataire et n’est jamais acceptée automatiquement par la seule réussite de Google.

#### `FR-005` — Trois portes d’accès

L’écran public initial affiche trois cartes distinctes : « Accéder à l’espace Agence », « Accéder à l’espace Locataire » et « Accéder à l’espace Propriétaire », ainsi que la phrase « Un seul compte Loya peut donner accès à plusieurs espaces. ». Chaque carte ouvre le même composant Google/OTP en conservant uniquement une intention de navigation signée et temporaire ; cette intention n’accorde aucune permission et ne peut jamais devenir une source d’autorisation.

Après authentification, le serveur vérifie les rattachements et invitations réels. Un utilisateur avec un seul contexte autorisé y accède directement ; un utilisateur multi-rôles ouvre le contexte demandé lorsqu’il y est autorisé et conserve « Changer d’espace » dans son profil. Un clic sur une porte non autorisée présente les espaces réellement disponibles ou l’action admissible, sans créer de rôle. Un lien d’invitation ouvre directement le panneau commun dans le bon contexte sans repasser par les trois cartes.

### 6.2 Paramétrage Agence et référentiels

#### `FR-010` — Onboarding Agence

Un utilisateur authentifié qui choisit explicitement « Créer mon espace Agence » renseigne au minimum l’identité de l’Agence, son numéro WhatsApp, sa politique d’échéance par défaut et son taux de commission propriétaire par défaut. La première validation métier crée atomiquement une Agence brouillon et son rattachement `ADMIN` ; ni l’OTP ni le callback Google ne créent ce rôle. Chaque étape validée est sauvegardée et versionnée afin qu’une reconnexion reprenne exactement la dernière progression ; une correction antérieure recalcule les étapes dépendantes avant activation. L’Agence ne peut être activée tant que le numéro WhatsApp obligatoire n’est pas valide. Google vérifie seulement l’identité de connexion : il ne vérifie ni l’entreprise, ni son représentant, ni son aptitude à encaisser. L’Agence choisit de démarrer le parcours KYB FedaPay pendant l’onboarding ou plus tard ; l’activation de l’espace reste possible sans capacité « prête », mais aucun paiement en ligne ne l’est avant validation complète. Lorsqu’il est démarré, Loya redirige exclusivement vers le parcours hébergé/contractuel FedaPay validé : aucune pièce, donnée de représentant légal ou preuve KYB n’est collectée, validée ou copiée dans Loya. Le tableau de bord distingue la capacité d’encaissement FedaPay « non commencée », « en validation », « prête » ou « bloquée », sans afficher le solde, la disponibilité ou la date de règlement des fonds. Cet état est une projection en lecture seule des vérifications FedaPay/KYB : aucun rôle Agence ne peut se déclarer « prête » depuis les paramètres.

La garde serveur est fixe : `DRAFT` autorise uniquement la reprise de l’onboarding Agence (`A-01`) défini par `FR-010`; `ACTIVE` autorise les référentiels et paiements manuels selon les permissions, même si FedaPay n’est pas encore prêt ; `SUSPENDED` conserve la lecture des données et reçus mais bloque toute nouvelle mutation ou tentative de paiement utilisateur. Une suspension n’interrompt jamais la convergence technique d’un paiement FedaPay déjà engagé : webhook, relecture fournisseur, confirmation, ledger, reçu et notifications continuent de façon bornée et idempotente. Dans une Agence `ACTIVE`, le paiement FedaPay reste indisponible tant que la capacité n’est pas « prête ».

#### `FR-011` — Politique d’échéance

L’Agence configure : jour d’échéance de 1 à 31, nombre de jours de grâce, rappels, canaux, fréquence et horizon d’échéances futures accessibles au paiement anticipé. Si le mois est plus court que le jour choisi, l’échéance tombe le dernier jour calendaire du mois.

#### `FR-012` — Référentiels

L’Agence crée et modifie manuellement propriétaires, biens, unités et profils locataires. Aucun mécanisme d’import n’est disponible.

#### `FR-013` — Commission propriétaire

L’Agence configure un taux par défaut et peut définir un taux spécifique remplaçant le défaut pour chaque propriétaire. Le taux effectif applicable à une échéance est historisé. Un taux est compris entre 0 et 10 000 bps inclus ; toute valeur hors intervalle est refusée.

### 6.3 Affectations et échéances

#### `FR-020` — Affectation locative

L’Agence affecte un `TenantProfile` à une unité avec un montant de loyer en XOF, une date de début, une date de fin facultative et une politique d’échéance. L’affectation est `ACTIVE` ou `ENDED`. Une unité ne peut avoir qu’une affectation active ; une affectation terminée reste historisée et ne génère plus d’échéance.

#### `FR-021` — Première échéance

L’Agence peut saisir explicitement le montant de la première échéance. Ce montant reste indivisible et n’ouvre aucun prorata ou paiement partiel automatique.

#### `FR-022` — Changements futurs

Une modification de montant, de taux ou de calendrier ne s’applique, selon une date d’effet explicite, qu’aux échéances futures **non encore émises**. Toute échéance déjà émise, même pour un mois futur, conserve son montant, son propriétaire, son calendrier et ses taux capturés.

#### `FR-023` — Génération des échéances

Le système génère des échéances mensuelles uniques, évite les doublons et calcule `PENDING` ou `OVERDUE` selon la date d’échéance et les jours de grâce. Les jours de grâce n’altèrent jamais le montant dû.

### 6.4 Paiement FedaPay

#### `FR-030` — Sélection d’échéances

Depuis « PAYER MES LOYERS », le locataire authentifié sélectionne une échéance entière ou plusieurs échéances entières parmi ses logements. Un même ordre peut regrouper plusieurs affectations uniquement si elles appartiennent au même `TenantProfile`, à la même Agence, au même compte marchand, à la même devise et au même canal. Dans chaque affectation sélectionnée, les mois commencent par la plus ancienne échéance impayée et restent consécutifs. Les logements d’Agences différentes sont présentés par groupes et nécessitent des paiements distincts clairement annoncés avant toute confirmation.

#### `FR-031` — Paiement anticipé

Le locataire peut payer un ou plusieurs mois futurs dans la limite de l’horizon défini par l’Agence. Chaque mois doit déjà correspondre à une échéance entière identifiable.

#### `FR-032` — Identité du payeur

Seul le locataire authentifié initie le paiement depuis son espace. Il n’existe aucun lien public « payer pour quelqu’un ». Le numéro Mobile Money utilisé peut différer du numéro de contact enregistré dans son profil ; l’application ne certifie pas la propriété du compte Mobile Money.

#### `FR-033` — Récapitulatif avant paiement

Avant redirection ou confirmation, le contexte Locataire affiche les périodes, le loyer principal total, les frais FedaPay, puis le total qui sera débité. Le devis de frais est versionné, expire et doit être reconfirmé s’il change. Le CTA final est exactement « CONFIRMER LE PAIEMENT ». Aucun champ ne permet de saisir un montant libre. Ces deux montants propres au prestataire ne sont jamais exposés aux contextes Agence, Propriétaire ou Super Admin.

#### `FR-034` — Confirmation autoritative

Le retour navigateur ne confirme jamais le paiement. Seul un événement FedaPay authentifié, rapproché avec le compte marchand attendu et interprété par une table d’états fournisseur versionnée peut réussir l’ordre, marquer toutes ses échéances `PAID`, produire les écritures, préparer le reçu et émettre les notifications.

#### `FR-035` — Résultat Agence

Dès l’approbation FedaPay, l’Agence voit clairement « Loyer payé » avec locataire, unité, périodes et loyer exact. La disponibilité ou la date de règlement du compte/sous-compte FedaPay ne conditionne jamais cet état. La disponibilité présentée au Propriétaire reste la déclaration manuelle distincte définie par `FR-062`.

#### `FR-036` — Échec et reprise

Un paiement échoué, expiré ou annulé ne marque aucune échéance payée. Avant de recréer une tentative après délai ou réponse inconnue, le système vérifie l’état auprès du prestataire et détecte tout second débit approuvé.

#### `FR-037` — Moyens de paiement Locataire

L’écran « Payer mes loyers » propose Mobile Money et carte bancaire lorsque le canal est activé pour l’Agence. Mobile Money couvre au minimum MTN MoMo, Moov Money et Celtiis Cash selon les capacités FedaPay validées. La carte bancaire est toujours saisie sur l’interface hébergée et sécurisée du prestataire : l’application ne collecte, ne transmet et ne journalise aucun numéro complet, cryptogramme ou date d’expiration. Le devis de frais et le total débité sont recalculés pour le canal choisi avant confirmation.

### 6.5 Paiement manuel ou en espèces

#### `FR-040` — Enregistrement Agence

Un rôle autorisé peut valider une ou plusieurs échéances entières d’un même locataire et de la même agence. Toute échéance réservée par un ordre FedaPay encore actif ou ambigu est refusée. Les modes incluent espèces, virement bancaire, Mobile Money reçu hors application et autres libellés configurés.

#### `FR-041` — Métadonnées manuelles

L’opération enregistre la date réelle d’encaissement, l’horodatage de saisie, l’auteur, le mode, une référence selon la politique, une note et une preuve facultative ou obligatoire selon la politique.

#### `FR-042` — Validation atomique

Le serveur calcule et enregistre lui-même la somme exacte des échéances entières sélectionnées ; aucun montant n’est reçu du client comme autorité. Il verrouille les échéances et crée dans une même transaction le paiement, ses lignes, les écritures, l’audit et l’événement de notification.

#### `FR-043` — Information Locataire

Le locataire reçoit « Paiement enregistré par votre agence », voit l’échéance `PAID` et peut télécharger son reçu. Dans le modèle produit, les frais prestataire valent zéro pour un paiement manuel.

### 6.6 Reçus

#### `FR-050` — Reçu locataire FedaPay

Le reçu locataire affiche : Agence, locataire, unité, périodes, identifiant, date, mode, loyer principal, frais FedaPay et total débité.

#### `FR-051` — Reçu manuel

Le reçu manuel affiche les mêmes éléments utiles, le mode déclaré et le loyer principal. Techniquement, les frais prestataire valent zéro, mais aucune ligne « Frais FedaPay » n’est affichée puisque FedaPay n’a pas participé à l’opération.

#### `FR-052` — Immutabilité

Un reçu final est versionné ou remplacé par une correction traçable. Il n’est jamais modifié silencieusement après émission.

### 6.7 Commissions et visibilité Propriétaire

#### `FR-060` — Ventilation par échéance

Pour chaque échéance confirmée, le système reprend le propriétaire et les taux Agence–Propriétaire et plateforme déjà figés sur l’échéance, puis calcule commission agence brute, montant dû au propriétaire, commission plateforme et revenu net agence. Si le revenu net Agence est négatif, le paiement reste confirmé : l’Agence et le Super Admin reçoivent un avertissement explicite et aucune charge n’est reportée sur le propriétaire.

#### `FR-061` — Consultation Propriétaire

Le Propriétaire consulte uniquement les biens pour lesquels son accès est actif. Pour chaque unité, le statut « Loué » ou « Vacant » est dérivé de l’affectation à la date consultée. Pour chaque période, il voit le loyer attendu, l’état « À venir », « À payer », « En retard » ou « Payé », la date et le mode d’encaissement lorsqu’il existe, le taux et la commission Agence, le net Propriétaire et la disponibilité déclarée par l’Agence.

Le point mensuel sépare explicitement, par bien puis pour l’ensemble du contexte autorisé : **loyer attendu** et **net Propriétaire attendu** pour les échéances non annulées de la période ; **loyer encaissé**, **commission Agence encaissée** et **net Propriétaire encaissé** pour les seules échéances `PAID` ; **loyer en retard** pour les seules échéances `OVERDUE` ; **net déclaré disponible auprès de l’Agence** pour les seuls items `PAID` et `AVAILABLE_WITH_AGENCY`. Le taux d’encaissement compare le principal encaissé au principal attendu. Le total disponible est une somme informative de déclarations datées, jamais une balance financière ni un reste à reverser. Les personnes concernées sont présentées comme « locataires avec un loyer en retard » ou « locataires en impayé », jamais comme « insolvables ». Le Propriétaire ne voit ni frais FedaPay, ni total débité Locataire, ni commission plateforme, ni coordonnées privées du Locataire non nécessaires. Aucun export CSV n’est proposé.

#### `FR-062` — Disponibilité déclarée auprès de l’Agence

Chaque item de loyer confirmé prend par défaut l’état de disponibilité Propriétaire `TO_CONFIRM`. Depuis son tableau de bord, un ADMIN ou COMPTABLE de l’Agence peut marquer individuellement ou en lot des items confirmés `AVAILABLE_WITH_AGENCY`. Une commande en lot contient une liste exacte d’items de la même Agence, valide l’ensemble avant écriture et s’applique atomiquement avec une clé d’idempotence ; un rejeu ne duplique ni déclaration ni notification. Le système conserve la date, l’acteur et la portée exacte de la déclaration. Une correction vers `TO_CONFIRM` exige un motif et une trace d’audit ; elle ne modifie ni le paiement du Locataire, ni le reçu, ni les commissions.

Le Propriétaire voit respectivement « À confirmer avec l’Agence » ou « Disponibilité déclarée par l’Agence le {date} », accompagné du CTA « Contacter l’Agence sur WhatsApp ». Cette information datée est purement déclarative : elle n’interroge ni la balance ni le sous-compte FedaPay, n’est jamais déduite d’un délai ou d’un état fournisseur, ne garantit pas une disponibilité actuelle et ne prouve pas que les fonds ont été reversés. Loya ne propose aucun état « Reversé », « Retiré » ou « Reçu par le Propriétaire », aucun justificatif et aucun solde restant à reverser.

Si le paiement valide est ensuite intégralement remboursé et que l’échéance quitte `PAID`, sa disponibilité disparaît atomiquement de la projection courante et des agrégats Propriétaire, tandis que son historique d’audit est conservé. Un nouveau paiement créera un nouvel item `TO_CONFIRM`. Le remboursement externe d’une charge FedaPay dupliquée n’altère jamais la disponibilité du paiement valide.

#### `FR-063` — Commission plateforme

Chaque loyer confirmé crée une créance de commission plateforme due par l’Agence. Le Super Admin paramètre et versionne le taux, compris entre 0 et 10 000 bps inclus et égal à 100 bps par défaut, produit un relevé périodique et enregistre son règlement par l’Agence. Les ADMIN et COMPTABLE de l’Agence reçoivent et consultent le relevé avec période, assiette, ajustements, crédit reporté, montant dû, échéance et statut. En V1, un règlement valide couvre exactement le montant positif dû : aucun sous-paiement ni surpaiement n’est accepté et `PAID` n’est atteint qu’après ce règlement intégral. Si le solde signé du relevé est nul ou négatif, aucun règlement n’est créé ; l’éventuel crédit Agence est reporté sur les relevés suivants et le relevé prend l’état `CREDIT`.

### 6.8 Tableaux de bord et exports

#### `FR-070` — Tableau de bord Agence

L’Agence voit au minimum les loyers dus, en retard et payés, les paiements récents, les nets Propriétaires calculés par période, les disponibilités restant à confirmer et les actions opérationnelles. Le loyer comptabilisé est toujours le principal exact, hors frais FedaPay. Aucun indicateur ne prétend représenter un solde restant à reverser.

#### `FR-071` — Tableau de bord Locataire

L’accueil Loya affiche la bienvenue, le total des loyers mensuels actifs, le prochain paiement, le total des loyers à venir, un aperçu des logements et le CTA principal « PAYER MES LOYERS ». Les agrégats peuvent couvrir plusieurs Agences ; lorsque le portefeuille en contient plusieurs, chaque logement affiche visuellement son Agence et aucun total agrégé n’autorise à les régler dans un ordre inter-agence.

#### `FR-072` — Tableau de bord Propriétaire

Le Propriétaire voit en lecture seule ses biens loués ou vacants, les loyers à venir/payés/en retard, les locataires associés à un impayé, son point mensuel avec métriques attendues/encaissées/disponibles séparées, la commission Agence et la déclaration datée de disponibilité. Il contacte l’Agence sur WhatsApp pour toute remise de fonds hors Loya. Aucun suivi de reversement, solde restant, justificatif ou export CSV n’est disponible.

#### `FR-073` — Export Agence

Un rôle Agence autorisé peut exporter des données opérationnelles simples. L’export ne contient ni `providerFeeXof` ni `tenantTotalDebitedXof` et ne comptabilise jamais ces montants comme loyer.

#### `FR-074` — Mes logements et détail Locataire

« Mes logements » liste les logements actifs avec photo facultative, nom, quartier/ville, loyer mensuel, prochaine échéance et statut textuel. La recherche filtre uniquement les logements autorisés. L’action d’ajout ouvre l’acceptation d’une invitation Agence ; elle ne permet jamais au locataire de créer lui-même un bien ou une affectation. Le détail reprend photo, adresse, loyer, prochaine échéance, dates et fréquence de location, Agence de rattachement, contact WhatsApp et derniers reçus. Son CTA principal est exactement « PAYER MON LOYER » et préselectionne uniquement les échéances de ce logement.

Le bloc de détail est nommé « Informations de location ». Il présente les données de l’affectation sans générer, signer, télécharger ou administrer un contrat.

#### `FR-075` — Paiements et reçus Locataire

L’écran « Paiements » regroupe historique et reçus. Il affiche une synthèse du total payé et des confirmations en attente, puis les filtres « Tous », « Payés » et « À venir ». Chaque paiement confirmé expose logement, périodes, principal, date et référence ; le téléchargement du reçu est disponible sur la ligne autorisée. Une échéance future n’est pas un impayé et reste visuellement distincte d’un paiement en confirmation.

### 6.9 Notifications et support

#### `FR-080` — Centre de notifications

Chaque contexte dispose d’une cloche avec badge, liste paginée, lu/non lu, « tout marquer comme lu » et liens profonds vers la ressource autorisée.

#### `FR-081` — Canaux

Les canaux V1 sont : centre in-app, web push et e-mail. Aucun SMS n’est prévu. Les notifications transactionnelles et de sécurité ne peuvent pas être désactivées.

#### `FR-082` — Événements

Le système notifie au minimum : invitation, échéance créée, rappel, retard, paiement en cours, succès, échec, paiement manuel validé, reçu disponible, remboursement externe enregistré, disponibilité déclarée ou corrigée par l’Agence pour le Propriétaire concerné, relevé de commission plateforme émis, règlement de relevé enregistré et changement de capacité FedaPay/KYB destiné aux ADMIN actifs de l’Agence. La notification Propriétaire rappelle la date de déclaration et son caractère informatif. La notification KYB reste limitée à « en validation », « prête » ou « bloquée » et ne révèle ni solde, ni disponibilité de balance, ni détail fournisseur sensible.

#### `FR-083` — Message de paiement Agence

Après approbation FedaPay, l’Agence reçoit « Loyer payé » avec locataire, unité, périodes, loyer exact et lien profond.

#### `FR-084` — Support WhatsApp

Les espaces Locataire et Propriétaire proposent « Contacter l’agence sur WhatsApp » vers le numéro obligatoire de l’Agence rattachée à la ressource courante — logement, groupe de paiement, paiement, bien ou point mensuel — avec message prérempli et contexte non sensible. Sans ressource courante, l’utilisateur choisit parmi ses Agences autorisées. Le serveur résout cette Agence depuis l’accès authentifié et n’accepte jamais un identifiant libre comme preuve. Si l’ouverture de WhatsApp échoue, le numéro peut être affiché et copié sans créer de ticket interne. Il n’existe aucun module de signalement ou de support interne.

### 6.10 Remboursement externe

#### `FR-090` — Demande

Le locataire contacte l’Agence par WhatsApp. Aucun bouton, endpoint ou job n’initie un remboursement FedaPay depuis l’application.

#### `FR-091` — Enregistrement

Après remboursement intégral réalisé hors application, l’Agence enregistre la date, la méthode, la raison, la référence et la preuve. L’intégralité signifie tous les items du paiement confirmé, jamais un sous-ensemble d’échéances ; pour une double charge, la cible est la charge fournisseur excédentaire et non le paiement valide. L’écran Agence affiche uniquement le principal intégral. Le traitement externe éventuel des frais est régi par le contrat FedaPay ; tant que sa règle n’est pas confirmée, Loya ne l’automatise pas et ne l’expose pas dans l’espace Agence. Aucun remboursement partiel n’est accepté.

#### `FR-092` — Effet métier

Pour un paiement valide, l’enregistrement crée des écritures d’extourne. Pour un paiement multi-mois, toutes ses échéances et leurs projections de disponibilité sont traitées atomiquement. Si le paiement remboursé était l’unique paiement valide, chacune redevient `PENDING` ou `OVERDUE`, toute disponibilité courante associée est retirée des vues/agrégats et un nouveau paiement entier peut être lancé. En cas de correction d’un débit dupliqué, seule la charge fournisseur et sa preuve externe sont résolues : les échéances restent `PAID` grâce au paiement valide conservé, leur disponibilité reste inchangée et aucune écriture de loyer ou commission n’est créée puis inversée pour le doublon.

### 6.11 Super Admin

#### `FR-100` — Administration plateforme

Le Super Admin gère les agences, la politique de commission plateforme, les relevés et leurs règlements, ainsi que les indicateurs techniques strictement nécessaires. Son entrée ne constitue jamais une quatrième porte publique : la route privée `/platform/sign-in`, absente de toute navigation publique, réutilise Supabase Auth, puis exige un `PlatformMembership` actif et un JWT Supabase `aal2` obtenu par MFA TOTP avant l’ouverture de tout écran Plateforme. Une identité authentifiée sans appartenance plateforme est refusée sans création de droit ni révélation de la liste des opérateurs. Les mutations sensibles exigent en plus une preuve TOTP datant de moins de cinq minutes. Après réauthentification et saisie d’un motif obligatoire, le Super Admin peut suspendre une Agence `ACTIVE` ou réactiver une Agence `SUSPENDED`; ces transitions sont auditables et n’altèrent ni ses données, ni sa capacité FedaPay. Aucun rôle Agence ne possède ce droit.

#### `FR-101` — Accès exceptionnel

Le rôle Super Admin n’accorde aucun accès général aux données métier. Un accès opérateur exceptionnel doit être séparé, temporaire, justifié, limité et audité.

## 7. Règles métier verrouillées

### 7.1 Paiements

- `BR-001` — **Aucun paiement partiel n’existe dans le produit.** Une échéance est indivisible.
- `BR-002` — Le locataire ne saisit jamais un montant de loyer libre.
- `BR-003` — Pour chaque affectation contenue dans un ordre, le groupe multi-mois ne contient que des échéances entières et consécutives à partir de la plus ancienne impayée de cette affectation.
- `BR-004` — Une échéance réservée par un ordre actif ne peut appartenir à un second ordre actif.
- `BR-005` — Un paiement est confirmé par webhook FedaPay authentifié et interprété par une table d’états versionnée, ou par commande manuelle Agence autorisée, jamais par le navigateur.
- `BR-006` — La disponibilité Propriétaire est déclarée manuellement par un ADMIN ou COMPTABLE de l’Agence et reste totalement distincte de FedaPay. Loya ne lit ni n’infère la balance ou le retrait d’un compte/sous-compte fournisseur.
- `BR-007` — Un remboursement enregistré est toujours intégral et déjà exécuté hors application.
- `BR-008` — Un ordre en ligne multi-logements reste limité à une seule Agence, un seul `TenantProfile`, un seul compte marchand, une seule devise et un seul canal. Une sélection inter-agence est scindée en parcours successifs et ne produit jamais une charge unique ambiguë.
- `BR-009` — « PAYER MES LOYERS » et « PAYER MON LOYER » sont des entrées de sélection d’échéances entières ; aucun de ces CTA ne confirme ni ne débite avant le récapitulatif des périodes, frais et total.

### 7.2 Montants

Pour un ordre :

```text
rentPrincipalTotalXof = somme(invoice.rentAmountXof)
tenantTotalDebitedXof = rentPrincipalTotalXof + providerFeeXof
```

- `BR-010` — Les frais FedaPay sont supportés par le locataire.
- `BR-011` — Les frais FedaPay et le total débité ne sont visibles que dans le contexte Locataire, dans le récapitulatif avant paiement et sur le reçu FedaPay. Ils sont absents des espaces, APIs, notifications, reçus internes et exports Agence, Propriétaire et Super Admin.
- `BR-012` — Les vues, reçus internes et exports Agence comptabilisent uniquement le loyer principal exact.
- `BR-013` — Les montants XOF sont stockés en entiers ; aucun flottant n’est autorisé.

### 7.3 Commissions

Les taux sont stockés en points de base : 100 bps = 1 %.

```text
agencyCommissionGrossXof = roundHalfUp(rentAmountXof * ownerCommissionRateBps / 10000)
ownerPayableXof          = rentAmountXof - agencyCommissionGrossXof
platformCommissionXof   = roundHalfUp(rentAmountXof * platformCommissionRateBps / 10000)
agencyNetRevenueXof      = agencyCommissionGrossXof - platformCommissionXof
```

- `BR-020` — Le taux Agence–Propriétaire est le taux convenu, avec défaut Agence et taux spécifique de remplacement possible par propriétaire.
- `BR-021` — Le taux plateforme est versionné par le Super Admin et vaut 100 bps par défaut.
- `BR-022` — La commission plateforme est payée par l’Agence, jamais par le locataire ni le propriétaire.
- `BR-023` — La commission plateforme ne réduit jamais `ownerPayableXof`.
- `BR-024` — Les frais FedaPay n’entrent dans aucune assiette de commission.
- `BR-025` — La date de résolution d’un taux est la `dueDate` de l’échéance dans le fuseau Agence. Le propriétaire et les taux effectifs sont figés à l’émission de l’échéance et restent auditables ; une échéance déjà émise n’est jamais réécrite.
- `BR-026` — Un `agencyNetRevenueXof` négatif est conservé tel que calculé, déclenche un avertissement Agence et Super Admin, ne bloque pas un loyer confirmé et ne réduit jamais `ownerPayableXof`.
- `BR-027` — Les accruals et relevés plateforme sont append-only. Une correction crée un accrual négatif lié à l’origine et porté sur le prochain relevé ouvert ; un relevé émis ou payé n’est jamais réécrit. Si la somme signée, crédit antérieur inclus, est nulle ou négative, le relevé est `CREDIT`, ne reçoit aucun règlement et reporte son crédit résiduel sur la période suivante.
- `BR-028` — Un relevé plateforme est réglé une seule fois pour son montant exact en V1 ; sous-paiement et surpaiement sont refusés.
- `BR-029` — Les taux Agence–Propriétaire et plateforme sont chacun compris entre 0 et 10 000 bps inclus. Une valeur négative ou supérieure à 100 % est refusée avant toute date d’effet.

Exemple de référence obligatoire : pour un loyer de 100 000 XOF, une commission agence de 10 % et une commission plateforme de 1 %, 90 000 XOF sont dus au propriétaire, la commission agence brute vaut 10 000 XOF, la plateforme reçoit 1 000 XOF et le revenu net agence vaut 9 000 XOF. Les frais FedaPay s’ajoutent uniquement au débit locataire.

### 7.4 Échéances et affectations

- `BR-030` — Une seule affectation active par unité.
- `BR-031` — Le jour 29, 30 ou 31 se rabat sur le dernier jour d’un mois plus court.
- `BR-032` — Les jours de grâce ne changent jamais le montant.
- `BR-033` — Les changements de loyer, de calendrier et de taux sont prospectifs et datés.
- `BR-034` — Une échéance historique confirmée est immuable hors écriture de correction explicite.
- `BR-035` — Le propriétaire effectif est figé sur chaque échéance et chaque item de paiement ; un changement futur de propriétaire ne réattribue aucun historique.
- `BR-036` — Une affectation `ENDED` reste consultable et ne génère plus aucune échéance après sa fin.

### 7.5 Identités et téléphones

- `BR-040` — En V1, un téléphone béninois est normalisé au format E.164 `+22901XXXXXXXX`, validé strictement et affiché dans un format local lisible.
- `BR-041` — L’OTP de connexion est exclusivement envoyé par e-mail. Le téléphone reste une donnée de contact, de support WhatsApp ou de paiement Mobile Money et ne sert jamais à recevoir un OTP Loya.
- `BR-042` — Supabase Auth authentifie un utilisateur, jamais un rôle. Google et l’OTP partageant la même adresse vérifiée convergent selon la liaison automatique standard de Supabase vers un seul `auth.users.id`. La création d’une Agence, l’accès membre, le rattachement Locataire/Propriétaire, le choix de contexte et l’activation FedaPay restent soumis à leurs propres contrôles.
- `BR-043` — Les trois portes Agence/Locataire/Propriétaire ne transportent qu’une intention de navigation. Un rôle ou un accès provient exclusivement d’une création d’Agence validée, d’un rattachement actif ou d’une invitation explicitement acceptée.
- `BR-044` — Loya ne crée, ne confirme, ne justifie et n’exécute aucun reversement au Propriétaire. Le statut de disponibilité n’est ni un reversement ni une preuve de remise de fonds.

## 8. États métier

| Agrégat | États autorisés | Interdiction essentielle |
|---|---|---|
| Échéance | `PENDING`, `OVERDUE`, `PAID`, `CANCELLED` | aucun état partiel |
| Agence | `DRAFT`, `ACTIVE`, `SUSPENDED` | `DRAFT` = onboarding seul ; `SUSPENDED` = lecture seule ; FedaPay exige en plus une capacité « prête » |
| Affectation | `ACTIVE`, `ENDED` | une affectation terminée ne génère plus d’échéance |
| Ordre en ligne | `CREATED`, `REQUIRES_ACTION`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `EXPIRED`, `CANCELLED` | succès sans événement autoritatif interdit |
| Paiement | `CONFIRMED`, `REFUNDED` | `REFUNDED` seulement après remboursement externe intégral enregistré |
| Charge fournisseur | classification `VALID_RENT` ou `DUPLICATE_APPROVAL` ; cycle `OBSERVED`, `CLASSIFIED`, `REFUND_RECORDED`, `RESOLVED` | une charge dupliquée ne crée jamais un second loyer |
| Disponibilité Propriétaire d’un loyer payé | projection active `TO_CONFIRM` ou `AVAILABLE_WITH_AGENCY` ; historique technique `INVALIDATED` après remboursement intégral | `INVALIDATED` n’est jamais affiché comme disponibilité courante ; état manuel informatif, aucun état de reversement/retrait/réception |
| Relevé/règlement plateforme | `DUE`, `PAID`, `OVERDUE`, `CREDIT`, `CANCELLED` | aucun règlement pour un relevé nul ou créditeur ; aucune déduction sur loyer locataire |

Chaque transition refusée doit retourner une erreur métier stable, ne créer aucune écriture partielle et être auditée lorsque l’intention est sensible.

## 9. Parcours critiques et critères d’acceptation

### `AC-001` — Paiement FedaPay d’un mois

**Étant donné** un locataire authentifié avec une échéance impayée,  
**quand** il confirme le paiement du total affiché et qu’un événement FedaPay valide l’approbation,  
**alors** l’ordre réussit une seule fois, l’échéance devient `PAID`, les écritures et commissions sont créées, l’Agence reçoit « Loyer payé », le locataire reçoit son reçu avec les frais et aucune vue Agence n’expose le total débité.

### `AC-002` — Plusieurs mois d’avance

**Étant donné** trois échéances consécutives disponibles,  
**quand** le locataire choisit les trois mois,  
**alors** un seul ordre réserve exactement ces trois échéances entières et les confirme ensemble ; aucune quatrième échéance, aucun mois discontinu et aucun montant libre ne sont acceptés.

### `AC-003` — Tentative partielle

**Étant donné** une échéance de 100 000 XOF,  
**quand** un client altéré envoie 50 000 XOF ou un sous-ensemble monétaire,  
**alors** le serveur refuse la commande, ne crée aucun paiement, ne change aucun état et journalise l’échec technique sans donnée sensible.

### `AC-004` — Paiement manuel

**Étant donné** deux échéances entières du même locataire,  
**quand** un COMPTABLE autorisé enregistre leur somme exacte en espèces,  
**alors** les deux échéances passent atomiquement à `PAID`, la preuve et les métadonnées sont conservées, le reçu omet toute ligne FedaPay et le locataire est notifié.

### `AC-005` — Webhook répété

**Étant donné** un événement FedaPay déjà traité,  
**quand** le même événement est reçu de nouveau,  
**alors** le serveur répond avec succès technique sans dupliquer paiement, écritures, commission, reçu ni notification.

### `AC-006` — Commission

**Étant donné** l’exemple 100 000 / 10 % / 1 %,  
**quand** le loyer est confirmé,  
**alors** les quatre montants obtenus sont exactement 10 000, 90 000, 1 000 et 9 000 XOF selon les formules de `BR-020` à `BR-024`.

Avec un loyer de 100 000 XOF, un taux Agence de 0 % et un taux plateforme de 1 %, le propriétaire reste dû de 100 000 XOF, le revenu net Agence vaut -1 000 XOF, le paiement n’est pas bloqué et les avertissements Agence et Super Admin sont créés.

### `AC-007` — Remboursement externe

**Étant donné** un paiement unique confirmé,  
**quand** l’Agence enregistre la preuve d’un remboursement intégral déjà exécuté,  
**alors** le paiement devient `REFUNDED`, les écritures sont extournées, toutes ses échéances reprennent atomiquement `PENDING` ou `OVERDUE` selon leur date, leurs disponibilités courantes disparaissent des projections Propriétaire, les anciennes réservations ne les bloquent plus et un nouveau paiement entier peut être lancé.

### `AC-008` — Isolation des objets et des contextes

**Étant donné** un utilisateur de l’Agence A,  
**quand** il présente un identifiant appartenant à l’Agence B,  
**alors** aucune donnée n’est révélée et aucune mutation n’est possible, y compris via export, notification, fichier ou tâche asynchrone.

**Étant donné** deux Locataires ou deux Propriétaires différents au sein de la même Agence,  
**quand** l’un tente de lire l’affectation, le paiement, le reçu, le bien, l’impayé ou le point mensuel de l’autre,  
**alors** les grants et politiques RLS refusent l’accès sans révéler l’existence de la ressource.

**Étant donné** les rôles ADMIN, GESTIONNAIRE, COMPTABLE et LECTEUR,  
**quand** chacun tente chaque mutation autorisée et interdite de la matrice,  
**alors** les tests allow/deny démontrent les permissions exactes, y compris la disponibilité Propriétaire. Le contexte Super Admin ne confère aucun accès général aux tables métier et tout accès opérateur exceptionnel reste séparé, temporaire et audité.

### `AC-009` — Responsive

**Étant donné** les largeurs 320, 360, 390, 768, 1024 et 1440 px,  
**quand** chaque parcours essentiel est exécuté,  
**alors** l’action principale reste visible et utilisable, aucune donnée financière n’est tronquée et aucun défilement horizontal commun n’est nécessaire.

### `AC-010` — Support

**Étant donné** un locataire connecté,  
**quand** il choisit l’aide ou un remboursement,  
**alors** WhatsApp s’ouvre vers le numéro de l’Agence rattachée à cette ressource avec un message contextualisé ; aucun ticket interne n’est créé et un identifiant d’Agence altéré ne peut pas rediriger le contact.

### `AC-011` — Double charge

**Étant donné** un paiement valide puis une seconde approbation fournisseur pour les mêmes échéances,  
**quand** l’événement excédentaire est traité,  
**alors** une charge fournisseur distincte est classée comme doublon, aucun second loyer, commission ou reçu n’est créé, et l’enregistrement ultérieur de son remboursement externe n’inverse pas le paiement valide.

### `AC-012` — Relevé plateforme corrigé

**Étant donné** un accrual inclus dans un relevé déjà émis ou payé,  
**quand** son loyer est régularisé,  
**alors** le relevé historique reste identique et un accrual négatif lié à l’origine est porté sur le prochain relevé ouvert. Si le solde signé devient nul ou négatif, aucun règlement n’est possible, le relevé est `CREDIT` et le crédit résiduel est reporté jusqu’à absorption par de futures commissions.

### `AC-013` — Paiement de plusieurs logements

**Étant donné** trois logements du même `TenantProfile` et de la même Agence, chacun avec une échéance entière impayée,  
**quand** le locataire les sélectionne depuis « PAYER MES LOYERS »,  
**alors** un seul ordre peut réserver les trois échéances, le récapitulatif détaille chaque logement et le total exact, et la confirmation crée un paiement avec trois items ventilés séparément. Si une quatrième échéance appartient à une autre Agence ou à un autre compte marchand, elle n’entre pas dans cet ordre et l’interface annonce un paiement distinct avant de poursuivre.

### `AC-014` — Accès Google et séparation des droits

**Étant donné** un nouvel utilisateur sur l’une des trois portes Agence, Locataire ou Propriétaire,  
**quand** il choisit « Continuer avec Google » et que l’identité Google est validée,  
**alors** un `auth.users.id` Supabase global et une session sont créés sans formulaire préalable. Un Locataire ou Propriétaire sans invitation ne voit aucune donnée métier ; un utilisateur entré par Agence sans rattachement peut choisir explicitement de créer une Agence et poursuivre le parcours « Créer mon espace Agence » (`A-01`) décrit par `FR-010`. Aucun rôle, accès, logement, bien ou capacité FedaPay n’est accordé par la porte choisie ou par Google.

**Étant donné** un compte Supabase déjà confirmé par OTP e-mail,  
**quand** Google retourne la même adresse vérifiée,  
**alors** la liaison automatique standard de Supabase réutilise le même `auth.users.id` et aucun doublon applicatif n’est créé. Une adresse non vérifiée ou un conflit refusé par Supabase ne déclenche aucune fusion artisanale.

**Étant donné** un utilisateur qui choisit l’OTP e-mail depuis l’une des trois portes,  
**quand** il saisit le code valide avant expiration,  
**alors** Supabase Auth ouvre une session pour le même `auth.users.id`, l’intention de navigation est conservée sans devenir une permission et le serveur ouvre uniquement un contexte réellement autorisé ou l’état d’attente d’invitation approprié.

**Étant donné** une invitation ou une intention d’entrée en cours,  
**quand** Google est annulé ou indisponible, ou que l’OTP expire, dépasse ses essais ou atteint sa limite de renvoi,  
**alors** l’interface conserve l’intention et l’invitation, affiche un message neutre avec le délai/action disponible et permet de reprendre par e-mail sans créer d’identité partielle ni révéler l’existence d’un compte. « Modifier l’adresse » n’est proposé que pour `SIGN_IN`; une preuve liée à une invitation, une liaison ou une action sensible propose plutôt changer de compte, annuler ou revenir sans modifier sa cible.

**Étant donné** une invitation ouverte,  
**quand** l’utilisateur choisit le mauvais compte Google ou laisse expirer la preuve avant de cliquer « Accepter l’invitation »,  
**alors** aucun droit n’est créé, l’aperçu de l’invitation est conservé et il peut choisir un autre compte Google ou renouveler la preuve par OTP e-mail. Seule la session du bon destinataire et une acceptation explicite consomment l’invitation.

**Étant donné** un utilisateur autorisé dans plusieurs contextes,  
**quand** il ouvre l’une des trois portes ou utilise « Changer d’espace »,  
**alors** seuls ses rattachements réels sont proposés, chaque cache de données du contexte précédent est purgé et toute requête revalide le contexte côté serveur et par RLS.

### `AC-015` — Point mensuel et disponibilité Propriétaire

**Étant donné** un Propriétaire avec deux biens autorisés, dont un loué avec un loyer payé et un autre avec un loyer en retard,  
**quand** il ouvre son point mensuel,  
**alors** il voit l’occupation exacte, les montants attendus, encaissés et en retard, la commission Agence, les nets Propriétaire attendu, encaissé et déclaré disponible clairement séparés, le locataire associé à l’impayé dans la limite des données autorisées et aucun terme « insolvable ».

**Étant donné** un loyer confirmé à l’état `TO_CONFIRM`,  
**quand** un ADMIN ou COMPTABLE de l’Agence le marque `AVAILABLE_WITH_AGENCY`,  
**alors** le Propriétaire voit « Disponibilité déclarée par l’Agence le {date} » et peut ouvrir WhatsApp vers cette Agence. Aucun reversement, preuve de transfert, solde restant ou état FedaPay n’est créé. Une modification venant d’un autre rôle, d’une autre Agence ou visant un loyer non payé est refusée ; le rejeu de la même clé est sans effet et n’envoie pas une seconde notification.

## 10. Exigences non fonctionnelles produit

- `NFR-001` — PWA web installable, mobile-first pour les quatre contextes.
- `NFR-002` — WCAG 2.2 niveau AA : contraste, clavier, lecteur d’écran, zoom, reflow à 400 % ou largeur équivalente de 320 CSS px, cibles d’au moins 44 × 44 px et mouvement réduit.
- `NFR-003` — Corps de texte de 16 px minimum sur mobile ; aucune désactivation du zoom.
- `NFR-004` — Aucun défilement horizontal sur les parcours communs à 320, 360, 390, 768, 1024 et 1440 px.
- `NFR-005` — Les mutations financières ne sont jamais placées en file hors ligne côté navigateur.
- `NFR-006` — Les données sensibles ne sont pas mises en cache public et les fichiers privés utilisent des URLs temporaires autorisées.
- `NFR-007` — Disponibilité, latence et erreurs sont mesurées par parcours ; les seuils chiffrés sont définis, testés et consignés dans le dépôt avant le pilote.
- `NFR-008` — Toutes les opérations sensibles sont autorisées côté serveur et produisent une trace d’audit exploitable.
- `NFR-009` — Les montants, dates d’effet et états sont déterministes et testables dans le fuseau métier configuré.
- `NFR-010` — Français clair, titres explicites, une action principale par écran, états vide/chargement/erreur/succès complets.
- `NFR-011` — La conformité locale, notamment la revue APDP, est validée avant pilote.
- `NFR-012` — L’application doit fonctionner en connectivité faible : lectures prudentes en cache, reprises explicites, aucune fausse confirmation.
- `NFR-013` — Les écrans Locataire appliquent le système visuel Loya suivant : fond `#fcfcfc`, identité bleu nuit avec accent doré discret, hiérarchie raffinée, quatre entrées de navigation « Accueil / Logements / Paiements / Profil » et fidélité vérifiée à 320, 360 et 390 px. Les libellés cités textuellement dans `FR-005`, `FR-033`, `FR-071`, `FR-074` et `FR-075` sont reproduits à l’identique.
- `NFR-014` — Les parcours OTP e-mail et Google restent utilisables au clavier, au lecteur d’écran et en connectivité faible ; un échec, refus ou indisponibilité Google propose immédiatement l’OTP e-mail sans créer de compte incomplet ni perdre l’invitation en cours.
- `NFR-015` — Le socle V1 est React/Vite PWA sur Cloudflare Workers, avec API métier Cloudflare Worker, Supabase Auth/Postgres/Storage/Queues et FedaPay isolé côté serveur. Ce socle est non substituable dans le périmètre décrit ici. Toute proposition d’évolution est hors périmètre et ne doit pas être implémentée sans instruction explicite du commanditaire.
- `NFR-016` — Toute table exposée par l’API de données Supabase active la RLS, révoque les privilèges inutiles et reçoit des politiques et tests allow/deny par contexte ; aucune clé secrète ou `service_role` n’est exposée au navigateur.

## 11. Données et événements à mesurer

Les mesures produit doivent être agrégées et minimisées :

- création et activation d’une Agence ;
- création d’une affectation valide ;
- nombre d’échéances générées, dues, en retard et payées ;
- démarrage, succès et échec des ordres, sans donnée Mobile Money sensible ;
- délai entre approbation et visibilité/notification ;
- création et téléchargement d’un reçu ;
- validation d’un paiement manuel ;
- passage manuel d’un loyer à « Disponible auprès de l’Agence » et correction motivée, sans donnée de reversement ;
- échec d’autorisation ou d’isolation agrégé ;
- performance et erreurs par largeur d’écran et parcours.

Les journaux analytiques ne doivent pas contenir de jeton, OTP, secret, numéro de paiement complet, corps brut FedaPay ou preuve privée.

## 12. Dépendances et validations externes

Ces points sont des validations d’implémentation, pas des invitations à modifier les règles produit :

1. Avant l’intégration réelle de FedaPay, confirmer le format signé, les identifiants stables, les frais retournés, les environnements, l’interrogation d’état, la relecture des transactions par compte marchand et la fenêtre temporelle après restauration, ainsi que les scénarios de double débit.
2. Valider les modèles de reçu et les mentions réglementaires avec les responsables locaux.
3. Valider la conformité APDP, la durée de conservation et les responsabilités de traitement.
4. Définir les seuils SLO, RPO et RTO pour Supabase et Cloudflare Workers, choisir les régions compatibles avec la revue APDP et tester la restauration avec rapprochement FedaPay.
5. Valider la consigne opérationnelle de déclaration manuelle « Disponible auprès de l’Agence » sans créer de suivi de reversement au Propriétaire.
6. Configurer Supabase Auth, le fournisseur Google, les URL de redirection par environnement, le SMTP transactionnel et la liaison automatique standard des identités. Aucun accès à une API Google métier n’est demandé.
7. Vérifier la configuration Data API Supabase : exposition explicite des seules tables nécessaires, grants minimaux, RLS et tests de politiques avant chaque environnement.

Codex doit isoler ces dépendances derrière des interfaces et utiliser des doubles de test ; il ne doit pas inventer de comportement FedaPay non confirmé.

## 13. Definition of Done produit

Une exigence est livrable seulement si :

- son besoin, ses exclusions et ses permissions sont respectés ;
- les tests unitaires, intégration, E2E et d’autorisation pertinents passent ;
- les montants et écritures ont des assertions exactes ;
- le parcours fonctionne à 320, 360, 390, 768, 1024 et 1440 px ;
- les états chargement, vide, erreur, reprise et succès sont présents ;
- les notifications, reçus et audits attendus sont idempotents ;
- l’accessibilité est vérifiée automatiquement et manuellement ;
- les données privées ne fuient ni dans les logs, ni les exports, ni le cache ;
- les deux méthodes d’accès, leurs collisions, l’acceptation d’invitation et l’absence de privilège automatique après Google sont testées ;
- les trois portes d’accès, le portefeuille Locataire multi-agence, le contexte Propriétaire mono-agence, l’entrée Plateforme non publique et le statut manuel de disponibilité sont testés sans fuite inter-contexte ni création de reversement ;
- la documentation technique et le runbook sont mis à jour ;
- aucun élément du périmètre exclu n’a été réintroduit.

## 14. Checklist anti-régression pour Codex

Avant chaque pull request, répondre explicitement :

- [ ] Ai-je créé, nommé ou suggéré un état de paiement partiel ? Si oui, supprimer.
- [ ] Un locataire peut-il saisir un montant arbitraire ? Si oui, supprimer.
- [ ] Les frais FedaPay apparaissent-ils côté Agence ou dans son CSV ? Si oui, corriger.
- [ ] La commission plateforme réduit-elle le propriétaire ? Si oui, corriger.
- [ ] Un taux sort-il de l’intervalle 0–10 000 bps ou un relevé `CREDIT` accepte-t-il un règlement ? Si oui, corriger.
- [ ] Une réponse navigateur peut-elle confirmer un paiement ? Si oui, corriger.
- [ ] Un remboursement peut-il être initié dans l’application ? Si oui, supprimer.
- [ ] Ai-je ajouté contrat, état des lieux, maintenance, signalement, rapport avancé, import ou CSV propriétaire ? Si oui, retirer.
- [ ] Le bloc « Informations de location » a-t-il été transformé en gestion de bail ou contrat ? Si oui, retirer cette extension.
- [ ] Un ordre « PAYER MES LOYERS » mélange-t-il plusieurs Agences ou comptes marchands ? Si oui, scinder avant confirmation.
- [ ] Mobile Money ou carte bancaire peut-il contourner le devis de frais ou faire transiter des données carte dans l’application ? Si oui, corriger.
- [ ] L’interface fonctionne-t-elle d’abord sur mobile pour chaque contexte ?
- [ ] Toute opération est-elle limitée à l’agence et au rôle autorisés ?
- [ ] Toute opération financière est-elle idempotente, atomique et auditée ?
- [ ] Ai-je réintroduit un mot de passe, un OTP téléphone, un SMS ou une authentification WhatsApp ? Si oui, supprimer.
- [ ] « Continuer avec Google » accorde-t-il un logement, un rôle, une invitation, une Agence active ou une capacité FedaPay sans leur contrôle métier ? Si oui, corriger.
- [ ] Une porte Agence/Locataire/Propriétaire est-elle utilisée comme autorisation plutôt que comme simple intention de navigation ? Si oui, corriger.
- [ ] Un écran Propriétaire agrège-t-il plusieurs Agences au lieu d’exiger un contexte actif ? Si oui, corriger.
- [ ] L’entrée Plateforme est-elle affichée comme quatrième porte publique ou accessible sans `PlatformMembership` actif et MFA requis ? Si oui, corriger.
- [ ] Ai-je créé un reversement, un justificatif, un solde restant, un état « Reversé/Retiré/Reçu » ou une preuve de remise au Propriétaire ? Si oui, supprimer.
- [ ] « Disponible auprès de l’Agence » est-il déduit de FedaPay, d’un délai ou d’une balance plutôt que déclaré manuellement par un rôle autorisé ? Si oui, corriger.
- [ ] Une table Supabase exposée manque-t-elle de grants minimaux, RLS et tests allow/deny ? Si oui, bloquer la PR.
