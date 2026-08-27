# DESIGN — UX/UI et système d’interface — Gestion Locative IA V1

> Spécification UX/UI autonome destinée à Codex
>
> - Produit ciblé : **Loya V1**
> - Portée : direction artistique, navigation, écrans, composants, contenu, responsive et accessibilité complets
> - Ensemble d’implémentation courant : [PRD](./PRD_Gestion_Locative_IA_V1.md), [STI](./STI_Gestion_Locative_IA_V1.md) et [ROADMAP](./ROADMAP_Gestion_Locative_IA_V1.md)
> - Statut : **normatif et prêt pour implémentation**

## 0. Contrat d’exécution pour Codex

1. Concevoir et implémenter chaque écran à **360 px d’abord**, le vérifier à **320 px**, puis l’enrichir jusqu’à 1440 px.
2. Appliquer les mêmes règles métier que le PRD : l’UI ne doit jamais suggérer un paiement, un remboursement ou un solde partiel.
3. Ne jamais afficher les frais FedaPay ou le total débité locataire dans un espace Agence, Propriétaire ou Super Admin/Plateforme.
4. Conserver une action principale évidente par écran et fournir tous les états : chargement, vide, erreur, accès refusé, hors ligne, traitement, succès et contenu périmé.
5. Toute interface implémentée doit être navigable au clavier, lisible par lecteur d’écran, zoomable à 200 %, testée en reflow à 400 % et conforme WCAG 2.2 AA.
6. Les vues financières utilisent des view models propres au contexte ; ne pas réutiliser un DTO Locataire dans une vue Agence.
7. Les textes normatifs entre guillemets dans ce document sont des libellés obligatoires. Toute variante autorisée doit garder le même sens métier.
8. L’espace Locataire applique la composition, le ton visuel, les quatre entrées de navigation et les CTA spécifiés dans les sections 3 à 6. Les cadres de téléphone, l’heure système, les légendes numérotées et tout en-tête marketing de présentation ne font pas partie de l’application.

## 1. Direction UX

### 1.1 Promesse d’expérience

L’interface doit donner trois sensations : **clarté**, **confiance** et **contrôle**. Un locataire comprend immédiatement ce qu’il doit, les mois qu’il paie et le total qui sera débité. Une agence identifie immédiatement quel loyer est payé, par qui, pour quel logement et pour quelles périodes, puis déclare manuellement sa disponibilité Propriétaire. Un propriétaire comprend l’occupation, les impayés factuels, son net et la date de cette déclaration, sans confondre Loya avec un outil de reversement.

### 1.2 Principes

- **Mobile réel** : aucune tâche essentielle ne dépend d’une table large, d’un survol ou d’un clic droit.
- **Argent explicite** : toujours associer montant, période, mode, bénéficiaire et état.
- **Progression rassurante** : afficher ce qui est calculé, ce qui est en cours de confirmation et ce qui est confirmé.
- **Simplicité graduelle** : montrer le nécessaire, placer les détails dans une vue dédiée ou un accordéon accessible.
- **Prévention avant erreur** : désactiver une combinaison impossible et expliquer pourquoi.
- **Langage naturel** : « loyer », « mois », « payé », « en retard », jamais de jargon FedaPay ou comptable côté Locataire.
- **Contexte visible** : l’Agence active et le rôle sont reconnaissables avant toute opération financière.
- **Aucune fausse certitude** : le retour navigateur affiche « confirmation en cours » tant que le serveur n’a pas traité l’événement autoritatif.

### 1.3 Interdictions UX — verrouillées

- Aucun champ « montant à payer » libre pour le locataire.
- Aucun badge, filtre, texte ou barre de progression « partiellement payé ».
- Aucun CTA « payer une partie », « compléter le solde » ou « échelonner ».
- Aucun CTA « rembourser » déclenchant une opération fournisseur.
- Aucun ticket de support, formulaire de problème ou module maintenance.
- Aucun import de données.
- Aucun export CSV Propriétaire.
- Aucun écran de disponibilité du sous-compte FedaPay.
- Aucun écran, CTA ou statut de reversement, retrait, fonds reçus ou solde restant à remettre au Propriétaire.
- Aucun module contrat, état des lieux ou rapport avancé.

## 2. Architecture de l’information

### 2.1 Navigation Agence

Sous 1024 px, navigation basse, cinq entrées au maximum :

1. **Accueil**
2. **Biens**
3. **Locataires**
4. **Paiements**
5. **Plus**

`Plus` regroupe : Propriétaires, Affectations, Échéances, Disponibilités propriétaires, Commissions et relevés plateforme, Équipe et Paramètres. `A-15` est donc accessible sous cette entrée et, sur desktop, comme sous-navigation de Paiements/Finance.

À partir de 1024 px, la même architecture passe dans une barre latérale persistante. Les libellés et permissions ne changent pas ; les entrées de `Plus` peuvent être visibles comme sous-navigation sans créer une nouvelle hiérarchie mentale.

### 2.2 Navigation Locataire

1. **Accueil**
2. **Logements**
3. **Paiements**
4. **Profil**

Les reçus sont intégrés à **Paiements**. **Profil** ouvre `X-05`. Les notifications restent accessibles par la cloche universelle avec badge et ouvrent `N-01`, sans cinquième onglet. Le support WhatsApp est accessible depuis le détail d’un logement, un paiement et le profil ; dans le Profil, l’utilisateur choisit d’abord une Agence parmi ses accès autorisés. L’action d’ajout de **Mes logements** ouvre le parcours d’invitation ; elle ne crée jamais un bien.

À partir de 1024 px, ces quatre entrées deviennent une navigation horizontale simple dans l’en-tête. La cloche reste séparée. L’ordre et les libellés ne changent jamais entre mobile et desktop.

### 2.3 Navigation Propriétaire

Le contexte Propriétaire est toujours borné à une seule Agence active. Si l’utilisateur possède des accès Propriétaire dans plusieurs Agences, il en choisit une dans `X-04` ou via « Changer d’espace » ; aucune vue financière ne mélange leurs données.

Sous 1024 px, la navigation basse contient quatre entrées courtes :

1. **Accueil**
2. **Biens**
3. **Loyers**
4. **Plus**

`Plus` ouvre **Point mensuel** puis **Compte** ; **Compte** mène exactement à `X-05`. Le nom accessible de chaque destination reste complet même si l’icône domine à 320 px. À partir de 1024 px, les cinq destinations Accueil/Biens/Loyers/Point mensuel/Compte sont présentées horizontalement dans l’en-tête. L’espace gagne en respiration mais reste une interface de consultation, pas un back-office.

### 2.4 Navigation Super Admin

- **Agences**
- **Commission plateforme**
- **Supervision**
- **Audit**

Sous 1024 px, la navigation basse conserve quatre icônes ; le libellé visuel court « Commission » possède le nom accessible « Commission plateforme ». À 320 px, les libellés peuvent se replier sur deux lignes sans réduire la cible de 44 px. À partir de 1024 px : barre latérale. Les écrans métier internes d’une Agence ne sont jamais ajoutés à cette navigation.

### 2.5 En-tête global

L’en-tête contient selon le contexte :

- titre de page ou retour ;
- Agence active avec sélecteur si multi-agence ;
- cloche de notifications avec badge non lu ;
- accès WhatsApp dans les espaces utilisateurs concernés ;
- menu de compte.

Le changement d’Agence demande confirmation s’il existe un formulaire financier non soumis. Après changement, toutes les données, caches, filtres et liens sont rechargés pour le nouveau contexte.

Exception Loya : `L-01` et `L-02` sont des lectures portefeuille multi-agence et n’affichent aucun sélecteur d’Agence dans leur en-tête. L’Agence est visible sur les cartes/lignes et le contexte de paiement se choisit par groupe dans `L-04`.

#### État d’Agence global

Une Agence `SUSPENDED` affiche un bandeau persistant « Espace temporairement en consultation » avec texte et icône, jamais la couleur seule. Dans l’espace Agence, toutes les commandes métier sont masquées ou désactivées avec leur raison ; les listes, détails, justificatifs internes existants, compte et sécurité restent consultables. Dans les espaces Locataire et Propriétaire, les données historiques et reçus autorisés restent accessibles ; toute action de paiement rattachée à cette Agence est indisponible et propose « Contacter l’agence sur WhatsApp ». Une suspension ne bloque pas les actions globales de compte/sécurité ni le paiement d’un groupe appartenant à une autre Agence active.

Une Agence `ACTIVE` dont la capacité FedaPay n’est pas « Prête » reste utilisable pour les référentiels et les paiements manuels autorisés, mais ses CTA de paiement en ligne Locataire sont désactivés avec « Paiement en ligne temporairement indisponible pour cette agence » et le contact WhatsApp. Aucun écran ne laisse entendre que l’utilisateur peut activer lui-même cette capacité.

### 2.6 Parcours d’accès transverses

#### Trois portes et authentification — `X-01`

L’écran de connexion propose immédiatement trois cartes de même niveau, visibles sans menu ni écran intermédiaire :

1. **Accéder à l’espace Agence** — « Gérer mon agence » ;
2. **Accéder à l’espace Locataire** — « Consulter et payer mes loyers » ;
3. **Accéder à l’espace Propriétaire** — « Suivre mes biens et mes loyers ».

Sous les cartes, afficher la phrase normative : **« Un seul compte Loya peut donner accès à plusieurs espaces. »**

Chaque carte est un vrai bouton radio/carte sélectionnable avec icône, titre, aide et état sélectionné lisible sans couleur. La première visite n’en présélectionne aucune ; le CTA d’authentification reste disponible après sélection. Sur 320–599 px, les cartes sont empilées ; dès 600 px, elles peuvent former trois colonnes. Le choix crée seulement une intention `AGENCY | TENANT | OWNER`, rappelée au-dessus du panneau : « Connexion à l’espace Locataire », par exemple. Un lien « Changer d’espace » revient aux trois cartes sans perdre une invitation en cours.

Le panneau commun affiche ensuite :

1. bouton officiel pleine largeur **« Continuer avec Google »**, action principale ;
2. séparateur accessible « ou continuer par e-mail » ;
3. champ « Adresse e-mail » avec `autocomplete="email"` ;
4. CTA **« RECEVOIR UN CODE »** ;
5. confidentialité et conditions.

Le bouton Google appelle le flux OAuth/PKCE standard Supabase et effectue une navigation plein écran. L’UI ne construit pas d’`authorizationUrl` Loya, ne demande aucun scope métier et ne présente aucun écran de fusion. Avec la même adresse vérifiée, Google et l’OTP convergent automatiquement vers le même compte Supabase. Un échec ou une annulation Google ramène au panneau, conserve la porte choisie et l’invitation, puis place le focus sur l’option e-mail.

Il n’existe ni mot de passe, ni téléphone de connexion, ni SMS/WhatsApp d’authentification. La porte choisie ne crée aucun rôle. Les aides sont explicites :

- Agence : « Après la connexion, vous pourrez créer ou rejoindre une agence. L’activation des paiements exigera ensuite les vérifications FedaPay. »
- Locataire : « Votre logement apparaîtra après acceptation de l’invitation envoyée par votre agence. »
- Propriétaire : « Vos biens apparaîtront après acceptation de l’invitation envoyée par votre agence. »

États : aucune porte choisie, chargement de l’intention, redirection Google, annulation, fournisseur indisponible, réseau absent, adresse invalide et limite temporaire. Aucun message ne confirme l’existence d’un compte.

#### Code OTP e-mail — `X-02`

Afficher une valeur accessible compatible coller/autofill avec `autocomplete="one-time-code"`, l’adresse masquée, l’expiration et le renvoi temporisé. Le titre est « Saisissez le code reçu par e-mail ». L’OTP est géré par Supabase Auth : l’UI n’affiche ni finalité technique, ni challenge interne, ni mécanisme de liaison.

Actions : **« CONFIRMER »**, « Renvoyer le code » et, uniquement pour une finalité `SIGN_IN` libre, « Modifier l’adresse ». Dans une invitation, l’adresse cible reste figée : proposer « Changer de compte », « Annuler » ou revenir à `X-03`, jamais modifier le destinataire depuis `X-02`. Les états code incorrect/expiré, essais ou renvois limités, e-mail retardé et service indisponible ont un message neutre et une issue. Le timer reste hors région live ; erreurs et succès y sont annoncés sans déplacer le focus. Une validation réussie revient à la porte/intention sélectionnée ou à l’invitation en cours.

#### Invitation — `X-03`

L’aperçu présente Agence, type d’accès, adresse destinataire masquée et expiration. Sans session, il réutilise le panneau Google + OTP, en expliquant : « Connectez-vous avec l’adresse qui a reçu l’invitation ». Après authentification, le CTA distinct **« ACCEPTER L’INVITATION »** reste obligatoire ; la connexion seule n’accorde rien.

Depuis « Ajouter un logement » ou un accès sans lien courant, afficher « Collez le lien d’invitation envoyé par votre agence ». Le secret est échangé puis retiré immédiatement du champ et de l’URL. Un lien invalide, expiré, révoqué, déjà utilisé ou temporairement indisponible possède un état neutre sans fuite d’adresse complète ni contact non autorisé.

Si le compte connecté ne correspond pas au destinataire, afficher « Ce compte ne correspond pas à cette invitation » avec **« CHANGER DE COMPTE GOOGLE »**, **« UTILISER UN AUTRE E-MAIL »** et « Annuler ». L’aperçu reste intact, l’invitation n’est pas consommée et aucune fusion artisanale n’est proposée. Une Agence suspendue désactive l’acceptation sans consommer l’invitation.

#### Choix de contexte — `X-04`

Après authentification, afficher uniquement les rattachements réels : carte Agence avec rôle, carte Locataire par Agence/profil et carte Propriétaire par Agence. Si un seul accès correspond à la porte choisie, l’ouverture peut être directe ; sinon la liste garde la porte correspondante en premier et permet « Voir tous mes espaces ». Le changement purge les données et caches de l’ancien contexte.

Un utilisateur sans accès voit un état adapté :

- porte Agence : **« CRÉER MON AGENCE »** vers `A-01` ou « J’ai une invitation » ;
- porte Locataire/Propriétaire : « Ouvrez ou collez l’invitation envoyée par votre agence » ;
- aucune donnée métier factice n’est affichée.

Une Agence `DRAFT` apparaît « Configuration à terminer » avec progression et CTA « Reprendre ».

#### Compte et sécurité — `X-05`

Utiliser uniquement les capacités standard Supabase utiles à la V1 : adresse e-mail vérifiée, fournisseurs de connexion observés en lecture seule, session/appareil courant, « Déconnecter cet appareil » et « Déconnecter tous mes appareils ». Ne pas concevoir d’écran Loya de liaison, fusion ou dissociation Google ; la liaison automatique par même e-mail vérifié reste gérée par Supabase.

Les réglages contiennent aussi les préférences de notifications, « Changer d’espace » et le contact WhatsApp. Avec plusieurs Agences, l’utilisateur choisit l’Agence avant d’ouvrir WhatsApp. Après déconnexion ou changement de compte, caches, données en mémoire et souscription push sont purgés avant le retour à `X-01`.

#### Accès Plateforme et MFA Super Admin — `X-06`

L’espace Plateforme n’ajoute jamais une quatrième carte à `X-01`. Une route non référencée et protégée `/platform/sign-in` réutilise uniquement la partie Google/OTP du panneau commun, avec le titre « Accès opérateur Loya ». Après authentification Supabase, le serveur exige un `PlatformMembership` actif avant de créer le contexte `PLATFORM`; sinon il refuse l’accès et propose les espaces métier réellement autorisés, sans révéler la liste des opérateurs.

À la première entrée Plateforme, puis pour toute mutation sensible avec JWT `aal1` ou preuve TOTP trop ancienne, `X-06` ouvre l’étape Supabase MFA : saisie du code TOTP, appareil nommé si enrôlement, QR code + secret copiable une seule fois lors de l’activation, puis confirmation. Le CTA est **« VÉRIFIER ET CONTINUER »**. Le succès ouvre `S-01` ou revient à l’action en attente après relecture de sa version ; l’échec n’accorde aucune permission. Le MFA prouve l’identité mais ne remplace jamais `PlatformMembership`. La route applique rate limiting, réponse neutre et journalisation, et n’est jamais liée depuis les trois portes publiques.

## 3. Système visuel

### 3.1 ADN visuel Loya commun

Les quatre espaces partagent la même direction artistique : fond ivoire très clair, bleu nuit, surfaces blanches, accent doré discret, typographie raffinée, rayons sobres et couleurs d’état réservées à leur fonction. La densité et la composition changent selon le métier, jamais l’identité de marque. Toute modification globale conserve les contrastes WCAG AA.

```css
:root {
  --loya-background:    #fcfcfc;
  --loya-surface:       #ffffff;
  --loya-ink:           #0b1f2a;
  --loya-navy:          #0c2433;
  --loya-navy-strong:   #071923;
  --loya-gold:          #c7a55b;
  --loya-beige:         #f7f2eb;
  --loya-border:        #e6e2dc;
  --loya-muted:         #667085;

  --color-primary-50:   #eef2f3;
  --color-primary-100:  #dce5e8;
  --color-primary-600:  #16394a;
  --color-primary-700:  #0c2433;
  --color-primary-800:  #071923;

  --color-neutral-0:    #ffffff;
  --color-neutral-50:   #fcfcfc;
  --color-neutral-100:  #f7f2eb;
  --color-neutral-200:  #e6e2dc;
  --color-neutral-300:  #cbd5d1;
  --color-neutral-600:  #667085;
  --color-neutral-700:  #34454e;
  --color-neutral-900:  #0b1f2a;

  --color-success-50:   #edf6ee;
  --color-success-700:  #2f7d4a;
  --color-warning-50:   #fff8e8;
  --color-warning-800:  #8a5a12;
  --color-danger-50:    #fef2f2;
  --color-danger-700:   #b42318;
  --color-info-50:      #eef2f3;
  --color-info-800:     #16394a;

  --color-focus-inner:  #ffffff;
  --color-focus-outer:  #0c2433;
  --color-overlay:      rgb(7 25 35 / 58%);
}
```

Règles communes :

- fond de page `#fcfcfc`, surfaces blanches, texte bleu nuit et bordures chaudes discrètes ;
- bleu nuit pour la navigation, les CTA principaux et les synthèses majeures ;
- doré uniquement comme accent de marque, séparateur ou détail décoratif, jamais comme petit texte courant sur fond clair ;
- succès uniquement pour un état serveur confirmé ; avertissement pour action à confirmer/contenu périmé ; danger pour retard, erreur ou action destructive ;
- tout statut associe texte + icône + couleur ; jamais la couleur seule ;
- aucune surenchère de couleurs, aucun dégradé décoratif et aucune transparence vitrée ;
- focus à double bague blanc + bleu nuit, visible sur toute surface.

L’espace Locataire utilise de grandes respirations, des cartes de synthèse bleu nuit, un accent doré minimal, une navigation basse à quatre entrées et des titres éditoriaux. Les espaces Propriétaire reprennent une densité proche, avec priorité à la lecture. Agence et Super Admin utilisent des tables, filtres et sidebars plus denses sur desktop, mais conservent strictement les mêmes tokens, rayons, ombres, iconographie et hiérarchie de marque.

Le logo **Loya** et la signature « GÉREZ. LOUEZ. EN TOUTE SÉRÉNITÉ. » sont réservés au splash, à l’authentification et aux supports de marque, pas répétés dans chaque en-tête métier. Ne jamais utiliser le vert « succès » sur le retour FedaPay avant confirmation webhook.

### 3.2 Typographie

Utiliser une police système performante ou une police sans-serif auto-hébergée validée. Pile par défaut :

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

| Token | Mobile | Desktop | Usage |
|---|---:|---:|---|
| `display` | 28/34, 700 | 32/40, 700 | montant ou message majeur exceptionnel |
| `h1` | 24/32, 700 | 28/36, 700 | titre de page |
| `h2` | 20/28, 700 | 22/30, 700 | section |
| `h3` | 18/26, 600 | 18/26, 600 | carte/groupe |
| `body` | 16/24, 400 | 16/24, 400 | texte courant |
| `body-strong` | 16/24, 600 | 16/24, 600 | valeurs et actions |
| `caption` | 14/20, 400 | 14/20, 400 | métadonnée, jamais texte principal |

Montants : chiffres tabulaires (`font-variant-numeric: tabular-nums`), aucune taille inférieure à 16 px lorsqu’une décision dépend du montant.

Pour Loya, les titres d’écran, noms de logement et grands messages utilisent `Newsreader`, `Georgia`, serif, auto-hébergée, aux graisses 500–600. Les contrôles, montants, métadonnées et libellés restent en `Inter`. Ce contraste typographique apporte une élégance éditoriale sans sacrifier la lecture financière ; aucun texte métier essentiel n’utilise une capitale décorative ou une graisse inférieure à 400.

### 3.3 Espacement, rayons et ombres

Échelle 4 px : `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- padding écran : 16 px mobile, 24 px tablette, 32 px desktop ;
- espacement entre sections : 24 px mobile, 32 px desktop ;
- cartes : 16 px mobile, 20–24 px desktop ;
- rayon contrôle : 8 px ; carte : 12 px ; panneau/modal : 16 px ; pilule : 999 px ;
- bordure standard : 1 px neutral-200 ;
- ombre faible uniquement pour élévation, jamais pour remplacer une bordure.

### 3.4 Icônes et illustration

- Icônes cohérentes, trait 1.5–2 px, taille visuelle 20–24 px.
- Toute icône interactive a un nom accessible.
- Aucune icône seule pour un concept financier ambigu.
- Illustrations facultatives uniquement pour états vides ; elles ne doivent pas ralentir l’action ni infantiliser le produit.

### 3.5 Mouvement

- 120–180 ms pour feedback local, 180–240 ms pour panneau.
- Transitions sur opacité et transformation seulement.
- Aucun mouvement continu sur écrans financiers.
- Avec `prefers-reduced-motion: reduce`, supprimer les animations non essentielles.

## 4. Grille responsive et shells

### 4.1 Matrice normative

| Largeur | Navigation | Composition | Listes Agence | Actions |
|---:|---|---|---|---|
| 320–599 | basse + en-tête compact | 1 colonne | cartes | CTA collant au-dessus de la nav si nécessaire |
| 600–767 | navigation basse | 1–2 colonnes selon contenu | cartes | barre d’action fluide |
| 768–1023 | navigation basse conservée | 2 colonnes possibles | cartes ou table courte | actions en ligne si place |
| 1024–1279 | sidebar Agence/Super Admin | contenu centré | table accessible si utile | en-tête de page |
| 1280–1440+ | sidebar + contenu élargi | grilles 2–4 colonnes | table priorisée | actions groupées sans surcharge |

Tests obligatoires : 320, 360, 390, 768, 1024 et 1440 px.

### 4.2 Dimensions

- `AppShell` : largeur 100 %, min-width 0.
- sidebar : 256 px ouverte ; aucune rail compacte imposée entre 600 et 1023 px.
- contenu Agence/Super Admin : max 1280 px.
- contenu Locataire : max 720 px sur grand écran.
- contenu Propriétaire : max 960 px.
- formulaires courants : max 640 px ; étapes financières : max 720 px.
- bottom navigation : hauteur minimale 64 px + `env(safe-area-inset-bottom)`.
- une barre d’action collante se place au-dessus de la navigation basse et du clavier virtuel.

### 4.3 Règles de transformation

- Une table Agence devient une pile de `DataCard` sous 1024 px, sauf tableau très simple à deux colonnes.
- Les filtres latéraux deviennent un `FilterSheet` plein écran ou bottom sheet sous 768 px.
- Une `Dialog` desktop devient un panneau plein écran ou bottom sheet mobile selon la longueur.
- Les colonnes secondaires sont déplacées dans le détail, pas masquées sans accès.
- Aucun composant ne fixe une largeur provoquant un défilement global.
- Les libellés longs se replient ; les montants restent entiers et lisibles.

## 5. Composants partagés

### 5.1 `Button`

Variantes : `primary`, `secondary`, `ghost`, `danger`, `link`. Hauteur minimale 44 px, focus visible, état pending avec libellé stable (« Enregistrement… »), double clic bloqué sans masquer le résultat. Une action financière ne repose pas uniquement sur un toast.

### 5.2 `MoneyText`

Entrée : montant XOF entier et contexte sémantique. Sortie visuelle par défaut : `100 000 F CFA`. Le lecteur d’écran reçoit « cent mille francs CFA ». Aucun arrondi visuel abrégé (`100 k`) dans une confirmation, un reçu ou une ventilation.

### 5.3 `StatusBadge`

| État métier | Libellé UI | Ton |
|---|---|---|
| échéance `PENDING`, `dueDate` future | À venir | neutre/information |
| échéance `PENDING`, `dueDate` atteinte et avant retard | À payer | avertissement |
| `OwnerPaymentDTO.UPCOMING` | À venir | neutre/information |
| `OwnerPaymentDTO.DUE` | À payer | avertissement |
| `OVERDUE` | En retard | danger |
| `PAID` | Payé | succès |
| `CANCELLED` | Annulé | neutre |
| ordre `CREATED` | Préparation du paiement | information |
| ordre `REQUIRES_ACTION` | Action requise | avertissement |
| ordre `PROCESSING` | Confirmation en cours | information, jamais succès |
| ordre `SUCCEEDED` | Paiement confirmé | succès |
| ordre `FAILED` | Paiement non abouti | danger |
| ordre `EXPIRED` | Session de paiement expirée | neutre/avertissement |
| ordre `CANCELLED` | Paiement annulé | neutre |
| paiement `REFUNDED` | Remboursé par l’agence | neutre/information |
| disponibilité `TO_CONFIRM` | À confirmer avec l’Agence | avertissement |
| disponibilité `AVAILABLE_WITH_AGENCY` | Disponibilité déclarée par l’Agence | information/succès discret |
| relevé `CREDIT` | Aucun montant dû | information |

« À venir » et « À payer » sont deux libellés dérivés côté serveur d’une échéance `PENDING` et de sa date dans le fuseau Agence ; le client ne recalcule pas la bascule. Dans le contexte Propriétaire, le serveur fournit directement les équivalents `OwnerPaymentDTO.UPCOMING` et `DUE`; l’UI ne remappe pas `PENDING`. « À jour » est un état de présentation calculé pour un logement actif sans échéance en retard ; il ne crée aucun état financier en base. « En attente » désigne uniquement un ordre `PROCESSING` ou une confirmation fournisseur attendue. Après remboursement intégral, l’historique du paiement porte `REFUNDED`, mais la vue courante Propriétaire affiche de nouveau l’échéance `À payer` ou `En retard` et aucune disponibilité. Les badges de disponibilité décrivent une déclaration manuelle datée de l’Agence, jamais un solde FedaPay, un retrait ou un reversement.

Ne créer aucun badge partiel.

### 5.4 `InvoiceCard`

Ordre mobile : période, statut, date d’échéance, logement, montant du loyer, action. La zone sélectionnable et le CTA ne doivent pas créer deux contrôles imbriqués. Pour un mois futur, ajouter « Paiement anticipé disponible » si éligible.

Dans Loya, la variante `RentSelectionCard` reprend l’image carrée du logement, son nom, quartier/ville, période, échéance, principal entier et case de sélection de 44 px. L’image est informative mais jamais la seule manière d’identifier le logement. Une carte sélectionnée possède bordure, icône et annonce lecteur d’écran ; la couleur seule ne suffit pas.

### 5.5 `ConsecutiveMonthSelector`

Affiche les échéances de la plus ancienne impayée vers les mois futurs disponibles. Le comportement normatif est un contrôle accessible « Nombre de mois » : boutons moins/plus de 44 px, champ lisible et aperçu immédiat des périodes exactes. La valeur minimale est 1 et la valeur maximale provient des échéances disponibles de l’affectation.

Le composant ne permet jamais de sauter un mois, de retirer un mois intermédiaire ou de choisir une partie d’échéance. Il affiche la liste exacte et le principal recalculé par le serveur. Dans `L-04`, il s’ouvre dans un bottom sheet depuis la ligne d’un logement lorsqu’au moins deux mois sont disponibles. Plusieurs logements peuvent rester sélectionnés dans un ordre uniquement s’ils partagent la même Agence, le même `TenantProfile`, le même compte marchand, la même devise et le même canal ; la consécutivité est vérifiée séparément pour chaque affectation. Toute incompatibilité constitue un autre groupe de paiement et ne peut pas être ajoutée au total courant.

### 5.6 `FinancialSummary`

Le composant reçoit un `variant` strict :

| Variante | Lignes autorisées |
|---|---|
| `tenant-fedapay` | loyer total, frais FedaPay, total débité |
| `tenant-manual` | loyer total, mode et montant enregistré ; aucune ligne FedaPay |
| `agency` | loyer exact, commission agence brute, commission plateforme, net agence, montant propriétaire |
| `owner` | loyer exact, commission agence, net propriétaire, état de l’échéance et disponibilité déclarative si payée |
| `platform` | assiette loyer, ajustements, crédit d’ouverture, montant dû, crédit reporté et état du relevé |

Le typage doit empêcher qu’un `tenantTotalDebitedXof` soit rendu par `agency` ou `owner`.

Si `agencyNetRevenueXof` est négatif, la variante `agency` conserve la valeur signée et affiche un avertissement explicite ; elle ne modifie jamais la ligne « Montant propriétaire ». La variante `platform` montre aussi l’anomalie agrégée au Super Admin.

### 5.7 `DataCard` et `DataTable`

- Même information et mêmes actions, ordre adapté au support.
- En mobile, libellé + valeur ; en desktop, en-têtes de colonnes et tri accessible.
- Sélection en lot uniquement si l’action accepte toutes les lignes ; les échéances manuelles doivent partager locataire et Agence, et un lot de disponibilité ne contient que des items payés `TO_CONFIRM` de l’Agence active.
- Pagination et total de résultats visibles.
- État vide contextualisé après filtres avec bouton « Réinitialiser les filtres ».

### 5.8 `FilterSheet`

Filtres Agence : statut, période, propriétaire, bien, mode d’encaissement. Afficher le nombre de filtres actifs et le nombre de résultats. Boutons « Appliquer » et « Réinitialiser ». Conserver les filtres par page et Agence, pas entre Agences.

### 5.9 `NotificationItem`

Type, titre, message court, Agence, date, état lu et lien profond. Le point non lu a aussi un libellé accessible. Si la ressource n’est plus autorisée, ouvrir une page sûre : « Ce contenu n’est plus disponible dans votre accès actuel. »

### 5.10 `FileUploader`

Montre formats/taille, progression, analyse, erreur et retrait. Ne jamais exposer la clé de stockage. Sur réseau faible, permettre une nouvelle tentative explicite. Une preuve obligatoire bloque la soumission avec erreur associée au champ.

### 5.11 `WhatsAppAgencyLink`

Bouton secondaire visible pour le Locataire et le Propriétaire : « Contacter l’agence sur WhatsApp ». Le message prérempli contient nom du produit, type de demande et référence non sensible, par exemple :

> Bonjour, je vous contacte au sujet de mon loyer de mars 2026 (référence GL-…).

Ne pas inclure numéro Mobile Money, montant total débité, jeton, document ou donnée privée dans l’URL. Le numéro vient exclusivement de l’Agence rattachée à la ressource courante — logement, groupe de paiement, paiement, point mensuel ou disponibilité déclarée — au format E.164 `+22901XXXXXXXX`, jamais d’un `agencyId` libre fourni par le client. Depuis le Profil sans ressource courante, l’utilisateur choisit une Agence parmi ses accès autorisés. Si WhatsApp ne s’ouvre pas, afficher « Copiez le numéro de votre agence » avec une action de copie ; ne créer aucun ticket.

### 5.12 `AuthAccessPanel` et `OtpCodePanel`

`AuthAccessPanel` possède trois variantes fermées, toutes fondées sur Supabase Auth :

- `door-sign-in` sur `X-01` : `AccessDoorSelector` à trois options strictes `AGENCY | TENANT | OWNER`, bouton Google, champ e-mail, CTA OTP et résumé de l’intention ;
- `invitation-sign-in` sur `X-03` sans session : cible d’invitation figée, bouton Google et e-mail du destinataire prérempli/masqué sans sélecteur de porte ;
- `platform-sign-in` sur la route non publique de `X-06` : Google et e-mail sans porte métier, puis contrôle obligatoire de `PlatformMembership`.

`X-02` rend uniquement `OtpCodePanel` après demande de code : adresse masquée, six chiffres, confirmation, renvoi et changement d’adresse lorsqu’il est autorisé. Il ne répète ni les trois portes ni le bouton Google. Une invitation conserve sa cible ; l’option de changement passe par `X-03` et ne modifie jamais le destinataire.

Sur mobile, les trois portes de la seule variante `door-sign-in` sont empilées puis le panneau occupe la largeur utile ; dès 600 px, elles peuvent former trois colonnes au-dessus d’un panneau centré de 420 px maximum. La navigation au clavier suit Agence → Locataire → Propriétaire → Google → e-mail. Le groupe de portes utilise un nom accessible « Choisir l’espace de connexion » et annonce la sélection. Les autres variantes commencent directement à Google puis e-mail.

| Intention | Titre du panneau | Après authentification |
|---|---|---|
| `AGENCY` | Connexion Agence | accès Agence réel, `X-04` ou choix explicite « Créer mon agence » |
| `TENANT` | Connexion Locataire | accès Locataire réel, `X-04` ou invitation/état vide |
| `OWNER` | Connexion Propriétaire | accès Propriétaire réel, `X-04` ou invitation/état vide |

Le composant n’accepte aucune URL de retour, rôle ou identifiant métier. La création d’un compte Supabase ne s’affiche jamais comme « Agence activée », « Logement ajouté » ou « Invitation acceptée ».

### 5.13 `OwnerAvailabilityStatus` et `AvailabilityBatchBar`

`OwnerAvailabilityStatus` rend exactement :

- `TO_CONFIRM` : « À confirmer avec l’Agence » ;
- `AVAILABLE_WITH_AGENCY` : « Disponibilité déclarée par l’Agence le {date locale} » ;
- absence/invalidation : aucun badge de disponibilité courante.

Le composant reçoit une date serveur, pas une date saisie. Une aide persistante précise : « Cette déclaration est informative. Contactez l’Agence pour confirmer les modalités de remise des fonds. » Les mots « reversé », « retiré », « reçu », « garanti » et « disponible chez FedaPay » sont interdits.

`AvailabilityBatchBar`, visible seulement à l’ADMIN/COMPTABLE Agence, affiche le nombre d’items éligibles sélectionnés, leur net Propriétaire total informatif et le CTA **« DÉCLARER DISPONIBLE AUPRÈS DE L’AGENCE »**. Une sélection contenant une ligne non éligible est refusée avant confirmation avec la liste des lignes à retirer ; aucun succès partiel. Après confirmation, la barre affiche la date serveur et un lien « Voir les déclarations ». La correction d’une ligne utilise **« CORRIGER LA DÉCLARATION »**, exige un motif et ne modifie ni loyer payé, ni reçu, ni commission.

## 6. Parcours Locataire — spécification Loya

### 6.0 Règles normatives de composition

Les sections `L-01` à `L-05` fixent intégralement la hiérarchie, les proportions, les CTA, le thème et la densité. Tous les noms, dates, photos et montants proviennent des projections serveur ou des états de démonstration explicitement marqués. Les cadres et ombres de téléphone, l’heure système `9:41`, les numéros de présentation 1–5 et les textes marketing extérieurs sont exclus.

À 390 px, le premier contenu actionnable doit être visible sans zoom ; à 320 px, la composition se replie sans réduire le corps sous 16 px. L’architecture possède quatre onglets fixes et un fond `#fcfcfc`. La barre inférieure respectant la safe area est visible sur les destinations principales `L-01`, `L-02`, `L-04` et `L-05`. `L-03` est une route profonde avec retour et peut masquer cette barre ; `L-06` à `L-08` suivent la même règle de route profonde et restaurent l’onglet d’origine au retour.

### 6.1 Tableau de bord — `L-01`

Ordre obligatoire de `L-01` :

1. en-tête « Bonjour, » puis « Bienvenue, [Prénom] 👋 » lorsque la projection fournit un prénom non ambigu, sinon « Bienvenue 👋 » ; sous-texte « Voici le résumé de vos logements. » et cloche ;
2. carte bleu nuit « Total loyers mensuels » avec somme des affectations actives, période sélectionnée, nombre de logements et de loyers actifs ; une sparkline décorative peut illustrer la tendance mais reste masquée aux technologies d’assistance et ne remplace aucune valeur ;
3. deux cartes : « Prochain paiement » avec date et délai, puis « Loyers à venir » avec principal agrégé et période ;
4. bouton pleine largeur, très visible et exactement libellé **« PAYER MES LOYERS »** ;
5. « Aperçu des logements » limité à trois lignes avec image, nom, quartier/ville, Agence, loyer et statut, puis « Voir tout » ;
6. navigation basse.

Les totaux peuvent agréger plusieurs Agences pour la lecture. Lorsque plusieurs Agences sont présentes, chaque ligne de logement affiche leur nom dans un libellé discret, repris aussi dans le nom accessible ; le parcours de paiement segmente avant confirmation. Le bouton ouvre `L-04` ; il ne débite rien. Il n’est activé que si au moins un groupe possède une échéance due ou future autorisée, une Agence `ACTIVE` et une capacité FedaPay « Prête ». Sans échéance, il reste visible et désactivé avec « Aucun loyer disponible au paiement ». Si des échéances existent mais qu’aucun groupe n’est payable en ligne, le motif prioritaire est « Paiement en ligne temporairement indisponible » et un lien secondaire ouvre le choix de l’Agence à contacter sur WhatsApp.

`L-01`, `L-03` et `L-04` rendent la même projection serveur `onlinePaymentAvailability` : `AVAILABLE` active l’entrée ; `NO_ELIGIBLE_INVOICE` affiche l’absence de loyer payable ; `AGENCY_SUSPENDED` ou `FEDAPAY_NOT_READY` affiche l’indisponibilité temporaire sans détail KYB. L’UI ne reconstitue jamais cette garde depuis plusieurs champs ni depuis un retour FedaPay ; le serveur la recalcule encore au devis.

### 6.2 Mes logements — `L-02`

En-tête : retour si l’écran a été ouvert en profondeur, titre « Mes logements », nombre, recherche et action d’ajout. Le bouton `+` est nommé « Ajouter un logement par invitation » et ouvre `X-03`; il ne crée ni bien ni affectation.

Chaque carte affiche : photographie `cover`, badge dérivé « À jour » ou état pertinent, nom du logement, quartier/ville, Agence visible si le portefeuille en contient plusieurs, loyer mensuel entier, prochaine échéance et chevron. Sous 600 px, l’image conserve un ratio proche de `16:7`; utiliser `object-fit: cover`, `srcset`, taille explicite et placeholder neutre. Sans image, afficher un bloc beige sobre avec pictogramme de bâtiment et texte alternatif vide si décoratif.

La recherche porte sur nom, quartier, ville et Agence autorisés. États vides : « Aucun logement rattaché » avec action d’invitation, ou « Aucun logement ne correspond à votre recherche » avec réinitialisation.

### 6.3 Détail logement — `L-03`

Ordre obligatoire de `L-03` :

1. grande image de couverture avec retour et menu d’actions sûres ;
2. nom, quartier/ville et badge dérivé ;
3. cartes « Loyer mensuel » et « Prochain loyer » ;
4. CTA pleine largeur exactement libellé **« PAYER MON LOYER »** ;
5. bloc **« Informations de location »** : date de début, date de fin éventuelle et fréquence ;
6. carte « Votre agence » : nom, numéro et CTA WhatsApp ; aucun contact direct propriétaire ;
7. « Derniers reçus » avec période, principal, date et accès au détail.

« PAYER MON LOYER » ouvre `L-04` avec ce logement et sa plus ancienne échéance impayée présélectionnés. Il ne confirme rien. Pour une Agence `SUSPENDED` ou sans capacité FedaPay « Prête », le bouton reste visible mais désactivé, affiche le motif sûr et propose le contact WhatsApp de cette Agence. Le menu ne contient ni contrat, état des lieux, maintenance, signalement, import ou remboursement fournisseur. « Informations de location » est une projection de `RentalAssignment`, pas un bail numérique.

### 6.4 Payer mes loyers — `L-04`

`L-04` est la surface unique de sélection, choix du canal, devis et récapitulatif, dans cet ordre obligatoire :

1. titre « Payer mes loyers » et aide « Sélectionnez les loyers à payer » ;
2. sélecteur accessible « Choisir l’agence à payer » lorsqu’il existe plusieurs groupes ; chaque option affiche nom de l’Agence, nombre de loyers éligibles et disponibilité du paiement, sans identifiant libre ;
3. liste « Loyers à payer » avec `RentSelectionCard` : case 44 px, image, logement, quartier/ville, période, échéance et principal ;
4. accès au `ConsecutiveMonthSelector` pour chaque logement disposant de plusieurs mois ;
5. « Méthode de paiement » : Mobile Money ou Carte bancaire si disponible ; aucun canal n’est présélectionné à la première entrée ;
6. pour Mobile Money uniquement : opérateur si requis et champ exact « Numéro Mobile Money » avec `autocomplete="tel"`, aide de format et validation E.164 ;
7. après sélection d’au moins un loyer et d’un canal, « Récapitulatif du paiement » issu du devis serveur : sous-total loyers, **Frais FedaPay**, puis **Total à payer** ;
8. CTA exact **« CONFIRMER LE PAIEMENT »** et mention « Paiement sécurisé ».

Mobile Money précise les opérateurs disponibles validés — MTN MoMo, Moov Money, Celtiis Cash — et exige le numéro dans ce bloc avant le CTA final. Au clic, Loya crée l’ordre avec le devis puis transmet uniquement `mobileMoneyPhone` à la tentative serveur ; le numéro est chiffré jusqu’à sa remise au fournisseur, purgé dès qu’il n’est plus requis et ne devient jamais une donnée de profil implicite. Carte bancaire ne demande aucun numéro ni donnée carte et ouvre exclusivement l’interface hébergée FedaPay ; aucun PAN, cryptogramme, date ou nom de porteur n’est dessiné dans Loya.

Les frais proviennent du devis serveur du canal actif. Avant choix du canal, afficher « Choisissez un moyen de paiement pour calculer les frais », jamais un montant provisoire. Tout changement de canal, groupe, loyer ou nombre de mois invalide le devis courant et en demande un nouveau. Ne jamais afficher statiquement « 0 FCFA » sans devis valide. Pendant recalcul, désactiver le CTA et annoncer « Mise à jour du total ». Si le devis change ou expire : « Le total a changé. Vérifiez-le avant de confirmer », focus sur le récapitulatif et nouvelle confirmation obligatoire.

Plusieurs logements peuvent être cochés dans le groupe courant uniquement s’ils partagent la même Agence, le même `TenantProfile`, le même compte marchand, la même devise et le même canal. Toute incompatibilité apparaît dans un groupe séparé ; pour une autre Agence, afficher « Ce paiement sera effectué séparément pour [Agence] ». Le sélecteur de groupe reste visible au-dessus de la liste ; changer de groupe avec une sélection active ouvre une confirmation nommant l’Agence quittée, annule le devis courant et ne transporte aucune sélection. Aucun total ni ordre ne mélange deux groupes. Les identifiants techniques restent invisibles et sont validés par le serveur avant le récapitulatif. Aucun montant libre, aucun sous-ensemble monétaire et aucune sélection de mois discontinu.

Un groupe dont `onlinePaymentAvailability` n’est pas `AVAILABLE` reste visible pour comprendre les échéances, mais ses cases et **« CONFIRMER LE PAIEMENT »** sont désactivées. Afficher le motif sûr correspondant, sans détail KYB, puis « Contacter l’agence sur WhatsApp » lorsque l’accès est autorisé ; aucun devis, ordre ou tentative n’est créé. Les autres groupes disponibles restent payables séparément. Si l’état change après sélection, vider uniquement ce groupe, annoncer le changement et ne jamais ouvrir l’étape de confirmation.

### 6.5 Paiements et reçus — `L-05`

Ordre obligatoire de `L-05` :

1. titre « Paiements », sous-titre « Historique des loyers » et filtre ;
2. carte bleu nuit avec « Total payé » — somme des loyers principaux confirmés sur la période, frais FedaPay exclus —, « En attente » — somme du principal des ordres en confirmation, frais exclus —, nombre de paiements et état des impayés ;
3. onglets « Tous », « Payés », « À venir » ;
4. lignes groupées chronologiquement : état, période, logement, Agence visible lorsque la liste en contient plusieurs, référence, principal, date et bouton de téléchargement si reçu disponible.

« En attente » ne couvre que les ordres en confirmation. « À venir » regroupe les échéances futures et ne les qualifie pas d’impayées. Un reçu manuel et un reçu FedaPay suivent leurs projections distinctes. Le bouton de téléchargement possède le nom accessible « Télécharger le reçu de [période] pour [logement] ».

### 6.6 Traitement et résultat FedaPay — `L-06`

- en attente d’action : « Finalisez le paiement sur l’écran sécurisé. » ;
- retour navigateur : « Votre demande a été transmise. Nous vérifions le paiement. » ;
- échec connu : « Le paiement n’a pas abouti. Aucun loyer n’a été marqué payé. » ;
- délai : « La confirmation prend plus de temps que prévu. Nous vérifions la transaction. » ;
- succès serveur : « Loyer payé » avec logements, périodes et reçu en préparation/disponible.

Ne jamais afficher « fonds disponibles » ni « paiement garanti ». Pour un parcours multi-logements, le résumé liste chaque logement et le principal correspondant.

### 6.7 Détail et reçu — `L-07`

Afficher une vue HTML accessible avant le téléchargement PDF : Agence, logements, périodes, principal par item, principal total, frais FedaPay, total débité, mode, date, référence et statut. CTA « Télécharger le reçu PDF ». Pour un paiement manuel : méthode Agence et montant enregistré égal au principal, sans ligne FedaPay. Le reçu Locataire n’est jamais téléchargeable depuis un espace Agence ; tout justificatif interne est distinct et expurgé.

### 6.8 Aide et remboursement — `L-08`

Dans le détail du paiement :

> Pour demander un remboursement, contactez directement votre agence. Elle traitera votre demande en dehors de l’application.

CTA unique : « Contacter l’agence sur WhatsApp ». Aucun formulaire, ticket, CTA fournisseur ou promesse automatique.

## 7. Parcours Agence

### 7.1 Onboarding — `A-01`

Étapes courtes :

1. identité de l’Agence ;
2. contact et numéro WhatsApp obligatoire ;
3. échéance par défaut ;
4. commission propriétaire par défaut ;
5. choix « Configurer FedaPay maintenant » ou « Plus tard », puis parcours KYB hébergé/contractuel si démarré ;
6. récapitulatif et activation.

L’identité de connexion est déjà créée avant `A-01` par Google ou OTP e-mail ; l’onboarding ne redemande ni mot de passe ni téléphone de connexion. L’adresse vérifiée peut préremplir un champ distinct « E-mail de contact » qui reste éditable ; sa modification ne change jamais l’adresse de connexion ni une identité liée. Loya recueille uniquement ses paramètres métier locaux — nom d’affichage, contact, WhatsApp, échéance et commission. Les pièces, le représentant légal et toute donnée de vérification KYB sont saisis et validés exclusivement dans le parcours hébergé/contractuel FedaPay ouvert à l’étape 5 ; Loya n’en dessine aucun champ, n’en stocke aucune copie et ne les déclare jamais valides. Google n’atteste aucune valeur métier ou KYB.

La validation explicite de l’étape 1 crée l’Agence en brouillon et attribue atomiquement le rôle `ADMIN` au créateur ; l’ouverture de `A-01`, le succès Google ou l’OTP n’affichent jamais ce succès à eux seuls. Chaque étape terminée enregistre sa progression et sa version. Après fermeture, expiration de session ou reconnexion, le même brouillon rouvre à la dernière étape enregistrée ; double appui, reprise réseau ou nouvelle entrée `AGENCY_CREATE` ne créent pas une seconde Agence tant que ce brouillon existe. Le récapitulatif permet « Modifier » sur une étape antérieure : après validation, les étapes dépendantes sont recalculées et, si nécessaire, repassent à compléter avant activation. Un conflit de version affiche les valeurs serveur à relire et ne remplace jamais silencieusement une saisie plus récente.

Barre de progression textuelle « Étape 2 sur 6 ». Sauvegarder les données non sensibles. L’activation de l’Agence reste bloquée si WhatsApp est invalide, avec raison et lien de correction, mais n’exige pas que FedaPay soit déjà « Prête ». La capacité FedaPay est affichée séparément et en lecture seule : « Non commencée », « En validation », « Prête » ou « Bloquée ». « Configurer maintenant » n’est disponible qu’à l’étape 5, après revalidation des étapes 1–4 ; il ouvre uniquement l’URL fournisseur validée lorsqu’elle est fournie. Sans URL, afficher « Vérification en cours » avec les instructions serveur et « Reprendre la vérification », sans boucle ni succès anticipé. « Plus tard » permet de terminer l’activation de l’Agence ; depuis `A-17`, une Agence déjà active peut démarrer la même vérification ultérieurement. L’étape 5 n’est jamais cochée à partir du succès Google. Tant que FedaPay n’est pas « Prête », le CTA d’encaissement en ligne est désactivé avec explication, sans afficher de solde ni de disponibilité de fonds.

### 7.2 Accueil — `A-02`

Priorité mobile :

- alertes opérationnelles ;
- indicateurs Loyers payés / En retard / À payer ;
- paiements récents ;
- nets Propriétaires encaissés, disponibilités à confirmer et disponibilités déclarées sur la période ;
- actions rapides autorisées.

Afficher aussi l’état de capacité FedaPay lorsqu’une action est requise, sans métrique de sous-compte.

Les cartes de chiffres expliquent période et définition. Aucun frais FedaPay ni total locataire. Éviter les graphiques décoratifs ; une liste ou comparaison simple prévaut en V1.

### 7.3 Référentiels — `A-03` à `A-06`

Biens, unités, propriétaires et profils locataires utilisent recherche, cartes mobiles, table desktop, statuts actifs/inactifs et CTA « Ajouter ». Aucun bouton Import. Les formulaires demandent uniquement les données nécessaires.

ADMIN et GESTIONNAIRE disposent des CTA de création/édition des référentiels et des invitations Locataire/Propriétaire ; COMPTABLE et LECTEUR restent en lecture seule sans CTA. Les invitations de membre ne se trouvent pas ici et restent réservées à l’ADMIN dans `A-16`.

- `A-03 Biens` : identité, adresse métier minimale, propriétaire et unités ; changement de propriétaire uniquement prospectif, sans réattribution historique.
- `A-04 Unités` : bien parent, libellé, statut d’occupation et affectation active éventuelle.
- `A-05 Propriétaires` : identité, gestion des accès utilisateurs et invitation pour ADMIN/GESTIONNAIRE. La synthèse financière est visible à tout rôle possédant `finance.read` — ADMIN, GESTIONNAIRE, COMPTABLE et LECTEUR — tandis que le taux spécifique est modifiable uniquement par ADMIN et reste en lecture seule pour les autres rôles.
- `A-06 Profils locataires` : identité Agence-scoped, invitation et rattachement utilisateur pour ADMIN/GESTIONNAIRE, puis affectations ; un profil non revendiqué reste gérable par l’Agence sans accès utilisateur.

### 7.4 Affectation — `A-07`

Étapes : unité disponible, profil locataire, loyer, dates, politique d’échéance, taux propriétaire effectif, première échéance éventuelle, récapitulatif. Montrer :

- « Une seule affectation active est possible pour ce logement » ;
- date d’effet de chaque paramètre ;
- première échéance comme montant entier explicitement défini ;
- aperçu des trois premières dates d’échéance.

Le détail permet de terminer une affectation avec date et confirmation. Une affectation terminée reste consultable et l’écran explique qu’elle ne générera plus d’échéance.

Les mutations de `A-07` sont disponibles uniquement pour ADMIN/GESTIONNAIRE ; COMPTABLE et LECTEUR consultent sans CTA.

### 7.5 Échéances — `A-08`

Filtres : période, état, bien, propriétaire. Sur mobile : cartes avec locataire, unité, période, montant et statut. Sur desktop : tableau. ADMIN, GESTIONNAIRE et COMPTABLE accèdent aux commandes autorisées du détail ; LECTEUR reste en consultation. Aucun contrôle de modification directe du statut.

### 7.6 Paiements — `A-09`

La liste affiche : locataire, logement, périodes, loyer principal, mode, état, date. Elle n’affiche pas frais FedaPay ni total débité. Détail financier : principal par échéance, commission agence brute, commission plateforme, revenu net agence et montant propriétaire. Un espace Agence ne propose jamais le reçu Locataire FedaPay ; un justificatif interne éventuel est distinct et expurgé.

Après webhook approuvé, bannière/notification :

> **Loyer payé** — Afi D. · Appartement B2 · mars et avril 2026 · 200 000 F CFA

Le libellé ne dépend pas de la disponibilité du sous-compte.

### 7.7 Enregistrer un paiement manuel — `A-10`

Accessible uniquement à ADMIN et COMPTABLE disposant de `payment.manual.confirm`; GESTIONNAIRE et LECTEUR n’obtiennent ni CTA, ni route de mutation.

Flux mobile plein écran :

1. rechercher et choisir le locataire ;
2. sélectionner une ou plusieurs échéances entières compatibles ;
3. choisir le mode ;
4. date réelle d’encaissement ;
5. référence, note et preuve selon politique ;
6. récapitulatif ;
7. confirmation descriptive.

Le total est calculé par le serveur et rendu en lecture seule. Aucun champ montant. Une échéance réservée par un ordre FedaPay actif ou dont l’état fournisseur reste ambigu affiche « Paiement en ligne en cours » et n’est pas sélectionnable. CTA : « Enregistrer le paiement de [principal] ». Confirmation : « Les échéances sélectionnées seront marquées payées et le locataire recevra une notification et un reçu. »

Succès : page persistante avec lien vers le paiement interne et état « Reçu locataire disponible » ou « Génération du reçu locataire en cours », pas seulement un toast. L’Agence ne télécharge jamais le reçu `TENANT`; son justificatif interne expurgé reste une ressource distincte lorsqu’il existe.

### 7.8 Commissions propriétaires — `A-11`

Seul ADMIN dispose des contrôles de modification. GESTIONNAIRE, COMPTABLE et LECTEUR voient les taux et l’historique autorisés en lecture seule, sans CTA d’édition.

Paramètres :

- taux par défaut pour tous les propriétaires ;
- taux spécifique remplaçant le défaut sur une fiche propriétaire ;
- date d’effet ;
- historique des versions.

Les deux taux sont bornés de 0 à 100 % inclus. Le champ accepte pourcentage ou bps avec conversion visible ; toute valeur négative ou supérieure à 100 % est rejetée avant soumission.

Afficher un exemple calculé. La politique est résolue à la date d’échéance. Toute modification future demande confirmation : « Ce taux s’appliquera aux échéances non encore émises à partir du… Les échéances déjà créées ne changeront pas. » Si le net Agence devient négatif, afficher un avertissement persistant sans modifier le montant propriétaire.

### 7.9 Disponibilités propriétaires — `A-12`

Écran de déclaration manuelle, sans connexion au solde FedaPay et sans opération de reversement.

En tête, quatre cartes définies par période : « Loyers payés à confirmer », « Net à confirmer », « Déclarations effectuées » et « Net déclaré disponible ». Elles ne calculent aucun reste à reverser. Les filtres sont propriétaire, bien, période et état `À confirmer | Déclaré disponible`.

Chaque ligne/carte affiche propriétaire, bien/unité, période, paiement confirmé le, mode d’encaissement, principal, commission Agence, net Propriétaire, statut et date de déclaration éventuelle. Les ADMIN et COMPTABLE peuvent sélectionner individuellement ou en lot uniquement les lignes `TO_CONFIRM`; GESTIONNAIRE et LECTEUR consultent sans contrôle de sélection.

Le bandeau de lot reprend le nombre de loyers, les propriétaires concernés et le net total informatif. La confirmation affiche :

> Vous déclarez que ces loyers sont disponibles auprès de votre agence à la date enregistrée par Loya. Cette action n’effectue aucun transfert vers les propriétaires.

CTA : **« DÉCLARER LA DISPONIBILITÉ »**. La date est fixée par le serveur. Le succès persistant indique « Disponibilité déclarée le {date} pour {n} loyer(s) » et met à jour les lignes sans toast seul. Un conflit ou une ligne devenue inéligible annule tout le lot et indique les éléments à relire ; aucun succès partiel.

Dans le détail d’une déclaration, ADMIN/COMPTABLE disposent de **« CORRIGER LA DÉCLARATION »**. Une modale exige un motif, annonce le retour à « À confirmer avec l’Agence » et précise que le paiement Locataire reste payé. L’historique montre date, acteur, changement et motif. Aucun montant libre, méthode de remise, référence bancaire, preuve, état « Reversé/Retiré/Reçu » ou validation du Propriétaire n’existe.

### 7.10 Remboursement externe enregistré — `A-13`

Accessible depuis un paiement confirmé ou un incident de double charge uniquement pour ADMIN ou COMPTABLE disposant de `reconciliation.manage`. GESTIONNAIRE et LECTEUR n’obtiennent ni CTA ni mutation. Texte d’introduction :

> Utilisez cet écran uniquement après avoir remboursé intégralement le locataire en dehors de l’application.

Champs : date, méthode, raison, référence, preuve. Aucun montant n’est saisi. Pour un paiement valide, afficher uniquement le principal intégral et toutes les périodes concernées ; jamais les frais ni le total débité. Pour une double charge, afficher la référence de l’incident sans inverser le paiement valide. La confirmation précise qu’un remboursement du paiement valide rouvrira les échéances et retirera toute disponibilité Propriétaire courante, tandis que la correction d’une double charge conservera le loyer payé et sa disponibilité inchangée ; elle détaille aussi les écritures d’extourne applicables.

### 7.11 Exports Agence — `A-14`

Filtres : période, bien, propriétaire, statut, mode. Colonnes autorisées : échéance, principal, commission agence, commission plateforme, net propriétaire, disponibilité courante et date de déclaration. Aucun solde restant, reversement ou retrait. Afficher une note : « Les frais FedaPay payés par le locataire ne font pas partie de cet export. » Export disponible uniquement pour ADMIN et COMPTABLE ; aucun CTA ou accès pour GESTIONNAIRE/LECTEUR et aucun export Propriétaire.

### 7.12 Relevés plateforme — `A-15`

Les ADMIN et COMPTABLE consultent les relevés reçus : période, assiette de loyers, ajustements liés à une période antérieure, crédit d’ouverture, montant dû, crédit reporté, date d’échéance et état. Pour `CREDIT`, afficher « Aucun montant à régler » et, s’il est positif, le crédit reporté ; aucune action de règlement n’existe. Pour un montant positif, le règlement est externe et enregistré par le Super Admin. Aucun montant de règlement libre n’est proposé dans l’espace Agence.

### 7.13 Équipe et permissions — `A-16`

Liste des membres, rôle, statut, dernière activité utile et invitations. L'ADMIN invite, révoque et change un rôle avec confirmation. La matrice de permissions explique que GESTIONNAIRE ne confirme pas d'opération financière et que LECTEUR ne mute rien.

Le dernier ADMIN actif est protégé visuellement et côté serveur : son menu n'offre ni rétrogradation, ni révocation, ni désactivation. Une aide persistante explique « Ajoutez ou nommez d'abord un autre administrateur actif ». Si l'état a changé entre affichage et confirmation, `LAST_ADMIN_REQUIRED` conserve la ligne, annonce la raison dans la modale/région live et replace le focus sur l'action concernée. Une invitation ADMIN en attente ne débloque pas ces contrôles.

### 7.14 Paramètres Agence — `A-17`

Sections : identité et fuseau, WhatsApp, échéance et grâce, rappels, horizon futur, modes manuels, politique référence/preuve, taux propriétaire par défaut et capacité FedaPay. Chaque changement financier affiche date d’effet et impact sur les opérations futures. Aucun paramètre de reversement ou de retrait Propriétaire n’existe.

Seul ADMIN peut modifier les paramètres ou démarrer/reprendre le parcours FedaPay. Les autres rôles voient uniquement les sections permises en lecture ; la capacité FedaPay reste en lecture seule pour tous et aucun contrôle n’accepte un statut.

## 8. Parcours Propriétaire

L’espace est strictement en lecture. Aucune action ne saisit ou confirme un reversement, un retrait, une réception de fonds ou une coordonnée bancaire.

### 8.1 Accueil — `O-01`

Priorité mobile :

1. sélecteur de période ;
2. cartes « Biens loués », « Biens vacants », « Loyers encaissés », « Loyers en retard » ;
3. carte distincte « Net déclaré disponible auprès de l’Agence » avec aide datée et lien vers `O-04` ;
4. liste « Loyers nécessitant votre attention » ;
5. aperçu des biens et CTA WhatsApp contextualisé.

Le nombre de « Locataires avec un loyer en retard » est factuel et ouvre la liste filtrée ; le terme « insolvable » n’apparaît jamais. Tous les agrégats sont limités à l’Agence active affichée dans l’en-tête. Les montants affichent période et définition. « Net déclaré disponible » n’est jamais nommé « solde », « reste à reverser » ou « montant retirable ».

### 8.2 Biens — `O-02`

Chaque carte affiche photo facultative, bien/unité, Agence, statut **« Loué »** ou **« Vacant »**, loyer mensuel et prochaine échéance. Pour une unité louée, afficher le nom d’usage du Locataire seulement s’il est autorisé, son état factuel « À jour » ou « Loyer en retard depuis le {date} », sans téléphone, e-mail, moyen de paiement ni autre donnée privée.

Le détail présente l’historique d’occupation minimal, les loyers de la période et la commission Agence applicable. Aucune édition, invitation, export ou accès au reçu Locataire.

### 8.3 Loyers — `O-03`

Filtres : mois, bien et état `Tous | À venir | À payer | En retard | Payés`. L’Agence active est le contexte d’autorisation, pas un filtre mélangeant plusieurs Agences. Chaque ligne/carte contient période, bien/unité, loyer attendu, date d’échéance, état, commission Agence et net Propriétaire.

Pour une ligne `PAID`, ajouter date et mode d’encaissement, puis :

- `TO_CONFIRM` : **« À confirmer avec l’Agence »** ;
- `AVAILABLE_WITH_AGENCY` : **« Disponibilité déclarée par l’Agence le {date} »**.

Une ligne non payée n’affiche aucun statut de disponibilité. Une ligne remboursée perd sa disponibilité courante et reprend l’état d’échéance calculé. Le CTA secondaire **« Contacter l’Agence sur WhatsApp »** utilise la ressource de cette ligne.

### 8.4 Point mensuel et disponibilités — `O-04`

En-tête : mois, nom de l’Agence active et aide « Comment ces montants sont calculés ». Pour consulter une autre Agence autorisée, « Changer d’espace » ouvre `X-04` et purge les données précédentes. Les cartes restent distinctes :

- **Loyer attendu** ;
- **Net Propriétaire attendu** ;
- **Loyer encaissé** ;
- **Commission Agence encaissée** ;
- **Net Propriétaire encaissé** ;
- **Loyer en retard** ;
- **Net déclaré disponible auprès de l’Agence**.

Ajouter le taux d’encaissement avec sa formule textuelle, jamais comme score de solvabilité. La ventilation par bien reprend attendu, encaissé, retard, net et disponibilité. Une liste « Déclarations de l’Agence » montre période, bien, net et date serveur.

Encart permanent :

> Les montants « déclarés disponibles » correspondent aux informations enregistrées manuellement par votre agence. Loya ne vérifie pas le solde FedaPay et n’effectue aucun reversement. Contactez l’agence pour convenir de la remise des fonds.

CTA : **« CONTACTER L’AGENCE SUR WHATSAPP »** vers l’Agence active résolue côté serveur. Aucun sélecteur libre, bouton « confirmer reçu », « retirer », « demander un reversement », aucune preuve et aucun CSV.

## 9. Parcours Super Admin

### 9.1 Agences — `S-01`

Liste minimale : identité, statut, date d’activation, état opérationnel technique pertinent. Aucun accès direct aux locataires, loyers ou propriétaires. Une élévation exceptionnelle ouvre un parcours séparé, justifié, temporaire et visible dans Audit.

Depuis le détail minimal, une Agence `ACTIVE` propose « Suspendre l’agence » et une Agence `SUSPENDED` propose « Réactiver l’agence ». Chaque action exige un `PlatformMembership` autorisé et, si nécessaire, le MFA TOTP `X-06`, puis un motif obligatoire et une modale qui décrit précisément l’effet : passage en consultation, blocage des nouvelles mutations et paiements, mais poursuite sûre des paiements déjà engagés. La confirmation reprend le nom et l’état cible ; le succès affiche un bandeau persistant et une entrée Audit. Aucun bouton n’existe pour `DRAFT`, aucun membre Agence ne voit ces commandes et la réactivation ne marque jamais FedaPay « Prête ».

### 9.2 Commission plateforme — `S-02`

Afficher le taux actif, sa date d’effet, l’historique et le taux par défaut de 1 %. Modification réservée au Super Admin autorisé : nouveau taux en bps/% borné de 0 à 100 % inclus, date d’effet, raison, MFA `X-06` si la preuve TOTP récente a expiré et confirmation. Au retour, restaurer la modale avec les valeurs non sensibles déjà saisies et relire la version avant soumission. Aucune rétroactivité silencieuse.

### 9.3 Relevés et règlements — `S-03`

Par Agence : période, assiette de loyers, taux capturés, ajustements, crédit d’ouverture, montant dû, crédit reporté et état `DUE/PAID/OVERDUE/CREDIT/CANCELLED`. Un règlement externe demande date, référence et preuve ; le montant exact positif du relevé est en lecture seule. La confirmation est réservée au Super Admin possédant un `PlatformMembership` actif, la permission plateforme et un MFA `aal2` frais via `X-06`; aucun rôle de l’Agence n’obtient ce formulaire. Sous-paiement et surpaiement sont impossibles. Un relevé `CREDIT` affiche « Aucun montant à régler », interdit le formulaire et reporte son crédit. Une correction postérieure apparaît comme ajustement lié sur un prochain relevé, jamais comme réécriture du relevé émis.

### 9.4 Supervision et audit — `S-04`, `S-05`

Montrer métriques techniques et anomalies sans données personnelles brutes. Les accès exceptionnels, changements de taux et règlements sont filtrables et exportables uniquement selon permission plateforme.

### 9.5 Accès opérateur exceptionnel — `S-06`

Parcours séparé du Super Admin courant : sélectionner une Agence, fournir motif, portée et durée, confirmer avec `PlatformMembership`, permission dédiée et MFA `X-06`, puis afficher un bandeau permanent d’élévation et un bouton de fin immédiate. L’accès expire automatiquement et chaque consultation/mutation est auditée. Aucune élévation silencieuse depuis `S-01`.

## 10. Centre de notifications — `N-01`

### 10.1 Structure

- En-tête « Notifications » + action « Tout marquer comme lu ».
- Onglets ou filtres accessibles « Non lues » et « Toutes ».
- Pagination stable ou chargement progressif avec annonce du nombre ajouté.
- Chaque item contient agence, titre, résumé, date relative + date absolue accessible, état et lien.

### 10.2 Messages normatifs

| Événement | Destinataire | Titre de référence |
|---|---|---|
| invitation | destinataire | « Invitation à rejoindre [Agence] » |
| capacité FedaPay/KYB mise à jour | ADMIN actifs de l'Agence | « État FedaPay mis à jour » ; détail limité à « En validation », « Prête » ou « Bloquée », vers `A-01`/`A-17` |
| échéance créée | Locataire rattaché | « Un nouveau loyer est disponible » |
| rappel | Locataire | « Votre loyer arrive à échéance » |
| paiement en cours | Locataire | « Vérification du paiement en cours » |
| FedaPay approuvé | Agence | « Loyer payé » |
| FedaPay approuvé | Locataire | « Votre loyer est payé » |
| paiement manuel | Locataire | « Paiement enregistré par votre agence » |
| reçu prêt | Locataire | « Votre reçu est disponible » |
| paiement échoué | Locataire | « Le paiement n’a pas abouti » |
| échéance en retard | Locataire | « Votre loyer est en retard » |
| remboursement externe | Locataire | « Remboursement enregistré par votre agence » |
| disponibilité déclarée/corrigée | Propriétaire | « Disponibilité de loyer mise à jour par votre agence » |
| relevé plateforme émis | ADMIN, COMPTABLE | « Nouveau relevé de commission plateforme » |
| règlement plateforme enregistré | ADMIN, COMPTABLE | « Relevé de commission réglé » |

Dans le centre in-app, la notification manuelle contient méthode, périodes, principal et lien vers le reçu ; la notification FedaPay Agence contient locataire, logement, périodes, loyer exact et lien vers le paiement, sans frais ni total débité. Les aperçus web push et e-mail restent génériques (« Un loyer a été payé », « Un paiement a été enregistré ») et ouvrent un lien profond authentifié : aucun nom, logement, période, montant ou détail financier n’apparaît sur un écran verrouillé ou dans un objet d’e-mail.

Pour le remboursement externe d’une charge dupliquée, le titre Locataire devient « Remboursement d’un débit en double enregistré ». Le détail montre Agence et référence, sans laisser croire que les périodes, le loyer valide ou le reçu ont été annulés ; aucune seconde notification « Votre loyer est payé » n’est émise.

La notification Propriétaire ouvre `O-03` ou `O-04` et affiche dans le centre authentifié le bien, la période, le net et la date de déclaration. Push et objet d’e-mail restent génériques. Une correction dit « La disponibilité d’un loyer est à confirmer avec votre agence » ; elle ne dit jamais qu’un retrait ou reversement a été annulé.

Un rejeu de la même déclaration n’ajoute ni nouvel item ni seconde notification. Une nouvelle version réellement corrigée produit au plus une nouvelle notification factuelle.

### 10.3 Préférences — `N-02`

Les notifications transactionnelles et de sécurité ne présentent aucun interrupteur de désactivation. Les préférences facultatives expliquent les canaux disponibles : in-app, web push et e-mail. Le consentement web push est demandé dans un contexte explicite, jamais au premier affichage sans explication. À la déconnexion ou au changement de compte sur un appareil partagé, la souscription de ce navigateur est révoquée avant d’afficher l’écran de connexion. Aucun SMS.

## 11. Recherche, filtres et listes

- Recherche Agence : nom, téléphone, bien, logement ou référence de paiement.
- Délai de saisie raisonnable et bouton d’effacement accessible.
- Le serveur reste autoritatif ; aucune liste financière entière chargée pour filtrage client.
- Filtres dans l’URL ou l’état de navigation pour retour arrière cohérent, sans exposer de données sensibles.
- Le changement d’Agence réinitialise les filtres.
- Afficher « 24 résultats » et annoncer les mises à jour via région live polie.
- Un résultat vide après filtres propose « Réinitialiser les filtres » ; un vrai vide propose l’action métier pertinente.

## 12. Formulaires

### 12.1 Règles générales

- Label visible au-dessus du champ ; placeholder uniquement comme exemple.
- Champs regroupés par sens, pas plus de 5–7 champs visibles sans section.
- Claviers : `inputmode=tel` pour téléphone, `numeric` pour taux/jour, sélecteur de date accessible.
- Aide avant l’erreur, erreur près du champ, résumé d’erreurs au début après soumission.
- Focus placé sur la première erreur ; valeurs non sensibles conservées après erreur réseau.
- Bouton soumis désactivé pendant la requête, avec résultat idempotent en cas de reprise.
- Les montants calculés sont en lecture seule et non sous forme d’input désactivé difficile à lire.

### 12.2 Confirmations financières

Une confirmation décrit : action, acteur/destinataire, périodes, principal, mode et conséquences. Sur mobile, utiliser un panneau plein écran si le contenu dépasse une courte bottom sheet. Le bouton confirme avec un verbe spécifique : « Enregistrer le paiement », « Déclarer la disponibilité », « Corriger la déclaration », « Enregistrer le remboursement externe ».

Ne jamais employer « OK » comme action financière principale.

## 13. États système

### 13.1 Chargement

Skeleton de même structure pour listes et cartes ; spinner avec texte pour commande. Ne pas afficher un ancien montant comme actuel pendant un recalcul de frais.

### 13.2 Vide

- Agence sans bien : « Ajoutez votre premier bien pour créer une affectation. »
- Locataire sans échéance : « Aucun loyer à payer pour le moment. »
- Propriétaire sans bien autorisé : « Aucun bien n’est encore rattaché à votre espace. Contactez votre agence. »
- Propriétaire sans loyer sur la période : « Aucun loyer sur cette période. »
- Agence sans disponibilité à confirmer : « Tous les loyers payés de cette sélection ont été traités. »
- Notification vide : « Vous n’avez aucune notification. »

### 13.3 Hors ligne

Bannière persistante : « Vous êtes hors ligne. Les paiements et validations sont indisponibles. » Seules les lectures déjà présentes dans la mémoire volatile de la session active ou explicitement non sensibles peuvent rester visibles et sont datées : « Dernière mise à jour à 14:32 ». Aucun JSON financier, reçu ou justificatif n’est persisté par le navigateur ou le Service Worker ; les autres blocs affichent un état indisponible. CTA « Réessayer ».

### 13.4 Erreur et contenu périmé

- Conflit d’échéance : « Cette échéance vient d’être payée ou réservée. Actualisez la liste. »
- Frais modifiés : « Le total a été mis à jour. Vérifiez-le avant de confirmer. »
- Accès perdu : « Vous n’avez plus accès à ce contenu dans cette agence. »
- Service FedaPay indisponible : « Le paiement ne peut pas être lancé maintenant. Réessayez plus tard. »
- Lot de disponibilité modifié : « Certaines lignes ont changé. Aucune déclaration n’a été enregistrée. Relisez la sélection. »
- Déclaration déjà corrigée ou remboursée : « Cette disponibilité n’est plus modifiable. Actualisez le loyer. »

### 13.5 Succès

Une mutation financière réussie ouvre une page ou carte de résultat durable avec référence, action suivante et retour au détail. Un toast peut compléter mais ne remplace pas ce résultat.

## 14. Accessibilité WCAG 2.2 AA

### 14.1 Structure

- Landmarks `header`, `nav`, `main`, `aside` et `footer` cohérents.
- Un seul `h1`, hiérarchie sans saut arbitraire.
- Lien « Aller au contenu » au clavier.
- Ordre DOM identique à l’ordre visuel utile.
- Titre de document mis à jour à chaque route.

### 14.2 Interaction

- Cibles au moins 44 × 44 px.
- Focus visible d’au moins 2 px avec contraste suffisant.
- Le focus n’est jamais masqué par l’en-tête, un CTA collant, la navigation basse, une modale ou le clavier virtuel ; utiliser `scroll-padding` et marges de focus adaptées.
- Modales : focus initial pertinent, piège, fermeture Échap si sûre et restitution du focus.
- Aucune action au survol seulement.
- Navigation basse avec état courant exposé.
- Désactivation accompagnée d’une explication lorsqu’elle n’est pas évidente.
- Toute interaction de glisser-déposer possède une alternative par bouton, clavier et sélection standard.

### 14.3 Annonces

- `aria-live=polite` pour recalcul, filtres, progression et résultat non critique.
- `role=alert` pour erreur de soumission et perte de connexion critique.
- « Confirmation en cours » annoncé sans répétition agressive.
- Les badges et icônes ne sont pas lus deux fois.

### 14.4 Contraste, zoom et texte

- Contraste texte normal ≥ 4,5:1, grand texte ≥ 3:1, composants/focus ≥ 3:1.
- Zoom 200 % sans perte ni chevauchement et reflow à 400 % ou à une largeur équivalente de 320 CSS px sans défilement bidimensionnel pour les tâches courantes.
- Texte mobile courant ≥ 16 px.
- Aucun verrouillage du viewport.
- La surcharge utilisateur d’espacement des lignes, paragraphes, mots et lettres ne masque ni ne tronque le contenu.
- Montants et périodes ne sont jamais communiqués uniquement par position ou couleur.

### 14.5 Reçus

La vue HTML du reçu est entièrement accessible. Le PDF doit contenir du texte sélectionnable, un ordre de lecture logique, un titre et une langue ; viser un PDF balisé si la chaîne de rendu le permet sans dégrader la fiabilité.

### 14.6 Navigateurs et appareils

Tester au minimum Chrome sur Android réel, Safari sur iOS réel, puis Chrome, Firefox, Safari et Edge desktop maintenus. Couvrir un petit écran Android, un écran iOS avec safe areas, tactile et clavier/souris. Documenter les versions exactes utilisées par chaque campagne plutôt que de coder des exceptions par user-agent.

## 15. Contenu et terminologie

### 15.1 Glossaire UI

| Terme domaine | Texte utilisateur |
|---|---|
| `RentInvoice` | Loyer / échéance de [mois] |
| `PaymentOrder` | Paiement en cours |
| `rentPrincipalTotalXof` | Total des loyers |
| `providerFeeXof` | Frais FedaPay |
| `tenantTotalDebitedXof` | Total débité |
| `agencyCommissionGrossXof` | Commission agence |
| `ownerPayableXof` | Net propriétaire |
| `platformCommissionXof` | Commission plateforme |
| `OwnerRentAvailability.TO_CONFIRM` | À confirmer avec l’Agence |
| `OwnerRentAvailability.AVAILABLE_WITH_AGENCY` | Disponibilité déclarée par l’Agence le {date} |
| `ExternalRefundRecord` | Remboursement externe enregistré |

### 15.2 Termes interdits ou à contextualiser

- Interdits : « paiement partiel », « solde restant », « acompte », « échelonnement », « locataire insolvable ».
- Dans le contexte Propriétaire, interdire « reversé », « retiré », « reçu par le Propriétaire », « reste à reverser », « disponible chez FedaPay » et « fonds libérés ».
- « Payé » uniquement après confirmation autoritative ou validation manuelle atomique.
- « Remboursé » uniquement après enregistrement par l’Agence d’une opération intégrale déjà exécutée.
- Côté Locataire, préférer « agence » à « marchand » et « loyer » à « principal ».

### 15.3 Libellés Loya verrouillés

| Emplacement | Libellé visible |
|---|---|
| `L-01` action principale | `PAYER MES LOYERS` |
| `L-03` action principale | `PAYER MON LOYER` |
| `L-04` action finale | `CONFIRMER LE PAIEMENT` |
| bloc dates/fréquence | `Informations de location` |
| navigation | `Accueil`, `Logements`, `Paiements`, `Profil` |

Ne pas réintroduire « Payer immédiatement » ni le sous-texte « Régler vos loyers en quelques secondes ». La casse visuelle des CTA est en capitales, mais leur nom accessible suit une casse naturelle.

## 16. Inventaire des écrans et traçabilité

| ID | Écran | Références PRD |
|---|---|---|
| `X-01` | Trois portes + connexion Google ou e-mail | `FR-001`, `FR-004`, `FR-005`, `BR-041` à `BR-043`, `AC-014`, `NFR-014` |
| `X-02` | Saisie OTP e-mail Supabase | `FR-001`, `FR-004`, `BR-041`, `BR-042`, `AC-014`, `NFR-014` |
| `X-03` | Acceptation d’invitation e-mail | `FR-002`, `FR-004`, `BR-042`, `BR-043`, `AC-014`, `NFR-014` |
| `X-04` | Sélection de contexte ou bienvenue sans accès | `FR-003` à `FR-005`, `BR-043`, `AC-014` |
| `X-05` | Profil, session et préférences | `FR-001`, `FR-003`, `FR-004`, `BR-042`, `FR-084`, `NFR-014` |
| `X-06` | Accès Plateforme non public et MFA TOTP Super Admin | `FR-001`, `FR-100`, `FR-101`, `BR-042`, `NFR-008`, `NFR-014` |
| `L-01` | Tableau de bord Loya | `FR-071`, `FR-074`, `NFR-013` |
| `L-02` | Mes logements | `FR-003`, `FR-074`, `NFR-013` |
| `L-03` | Détail logement | `FR-031`, `FR-074`, `FR-084`, `NFR-013` |
| `L-04` | Payer mes loyers | `FR-030` à `FR-033`, `FR-037`, `BR-001` à `BR-013`, `AC-013` |
| `L-05` | Paiements et reçus | `FR-050` à `FR-052`, `FR-075`, `NFR-013` |
| `L-06` | Traitement/résultat | `FR-034` à `FR-036` |
| `L-07` | Détail et reçu | `FR-050` à `FR-052` |
| `L-08` | Aide/remboursement | `FR-084`, `FR-090` |
| `A-01` | Onboarding après création de l’identité | `FR-004`, `FR-010`, `FR-011`, `FR-013`, `BR-042`, `AC-014` |
| `A-02` | Accueil Agence | `FR-070` |
| `A-03` | Biens | `FR-012` |
| `A-04` | Unités | `FR-012` |
| `A-05` | Propriétaires | `FR-012`, `FR-013` |
| `A-06` | Profils locataires | `FR-002`, `FR-012` |
| `A-07` | Affectation | `FR-020` à `FR-023` |
| `A-08` | Échéances | `FR-023` |
| `A-09` | Paiements | `FR-035`, `FR-060` |
| `A-10` | Paiement manuel | `FR-040` à `FR-043` |
| `A-11` | Taux propriétaire | `FR-013`, `FR-060` |
| `A-12` | Disponibilités propriétaires | `FR-062`, `FR-070`, `BR-006`, `BR-044`, `AC-015` |
| `A-13` | Remboursement externe | `FR-091`, `FR-092`, `BR-007`, `BR-044` |
| `A-14` | Export Agence | `FR-073` |
| `A-15` | Relevés plateforme Agence | `FR-063`, `FR-082` |
| `A-16` | Équipe et permissions | `FR-002`, `FR-010` |
| `A-17` | Paramètres Agence | `FR-010` à `FR-013` |
| `O-01` | Accueil Propriétaire | `FR-003`, `FR-061`, `FR-072`, `BR-044` |
| `O-02` | Biens Propriétaire | `FR-003`, `FR-061`, `FR-072`, `BR-044` |
| `O-03` | Loyers Propriétaire | `FR-003`, `FR-061`, `FR-072`, `BR-044` |
| `O-04` | Point mensuel et disponibilités | `FR-003`, `FR-061`, `FR-062`, `FR-072`, `FR-084`, `BR-044`, `AC-015` |
| `S-01` | Agences | `FR-100` |
| `S-02` | Taux plateforme | `FR-063`, `FR-100` |
| `S-03` | Relevés et règlements | `FR-063`, `FR-100` |
| `S-04` | Supervision | `FR-100` |
| `S-05` | Audit | `FR-100`, `FR-101` |
| `S-06` | Accès opérateur exceptionnel | `FR-101` |
| `N-01` | Centre de notifications | `FR-080` à `FR-083` |
| `N-02` | Préférences et consentement push | `FR-081` |

## 17. QA design

### 17.1 Checklist par écran

- [ ] Écran vérifié à 360 puis 320 px avant enrichissement desktop.
- [ ] Action principale évidente et atteignable au pouce.
- [ ] Aucun défilement horizontal commun.
- [ ] Tous les états système sont conçus.
- [ ] Montants, périodes, mode et destinataire visibles avant confirmation.
- [ ] Focus non masqué, clavier, lecteur d’écran, reflow 400 % et surcharge d’espacement testés.
- [ ] Permissions et contexte Agence visibles et cohérents.
- [ ] Aucun texte ou composant hors périmètre.
- [ ] L’espace Locataire respecte l’ordre obligatoire de `L-01` à `L-05`, le fond `#fcfcfc`, la navigation à quatre entrées et les libellés obligatoires.
- [ ] Les cadres et ombres de téléphone, l’heure système, les numéros de présentation et l’en-tête marketing sont absents du produit.

### 17.2 Checklist financière

- [ ] Aucune saisie de montant pour paiement locataire ou validation manuelle.
- [ ] Aucun paiement ou remboursement partiel suggéré.
- [ ] Frais et total débité visibles seulement au Locataire.
- [ ] Loyer exact visible à l’Agence dès confirmation, sans état de sous-compte.
- [ ] Commission plateforme présentée comme dette/charge Agence, jamais propriétaire.
- [ ] Relevé `CREDIT` sans règlement, avec crédit reporté visible et montant dû nul.
- [ ] Revenu net Agence négatif averti sans altérer le propriétaire.
- [ ] `A-12` déclare uniquement des items payés, individuellement ou en lot atomique, avec date serveur et résultat durable.
- [ ] `O-01` à `O-04` distinguent attendu, encaissé, retard et disponibilité déclarée ; aucun agrégat n’est nommé solde ou reste à reverser.
- [ ] Aucun écran, champ, CTA, preuve, statut ou notification de reversement/retrait Propriétaire.
- [ ] Un remboursement retire la disponibilité courante sans effacer l’historique et sans afficher un reversement annulé.
- [ ] Reçu Locataire inaccessible à l’Agence ; justificatif interne distinct et expurgé.
- [ ] Une Agence suspendue ne lance aucune nouvelle mutation ou tentative ; les paiements déjà engagés peuvent seulement converger et les reçus existants restent lisibles selon audience.
- [ ] La capacité FedaPay est en lecture seule pour l’Agence et aucun écran ne permet de se déclarer « Prête ».
- [ ] Succès affiché uniquement après source autoritative.
- [ ] Confirmation descriptive, reprise réseau et résultat durable présents.

### 17.3 Checklist responsive

- [ ] 320, 360, 390, 768, 1024 et 1440 px testés.
- [ ] Frontières 599/600, 767/768 et 1023/1024 px testées.
- [ ] Navigation basse sous 1024 px.
- [ ] Sidebar Agence/Super Admin à partir de 1024 px.
- [ ] Cartes mobiles et tables desktop transportent la même information.
- [ ] Clavier virtuel, zones sûres, portrait et paysage testés.
- [ ] Locataire et Propriétaire restent simples sur desktop.

### 17.4 Checklist accès et identité

- [ ] `X-01` affiche simultanément les trois portes Agence, Locataire et Propriétaire avant le panneau commun Google/OTP.
- [ ] La porte sélectionnée est lisible au clavier, au lecteur d’écran et sans dépendre de la couleur ; elle n’accorde aucun droit.
- [ ] « Continuer avec Google » reste l’action d’authentification principale et l’OTP e-mail demeure immédiatement visible.
- [ ] Aucun champ téléphone, mot de passe, SMS ou WhatsApp d’authentification.
- [ ] Le flux Google utilise le parcours standard Supabase ; aucune URL OAuth Loya, fusion, liaison ou dissociation artisanale n’est dessinée.
- [ ] Le même e-mail vérifié Google/OTP mène au même compte Supabase sans suggérer un doublon.
- [ ] La création d’identité ne promet ni logement, ni rôle, ni Agence active, ni validation FedaPay.
- [ ] `X-03` exige une acceptation explicite ; mauvais compte, invitation expirée/révoquée/suspendue et reprise ont un état sûr sans fuite.
- [ ] Annulation/panne Google, OTP expiré/limité et hors ligne conservent porte et invitation avec issue e-mail.
- [ ] `X-04` liste seulement les rattachements réels et purge les caches à chaque changement.
- [ ] `X-05` se limite aux capacités de compte/session Supabase retenues ; la déconnexion purge données et push.
- [ ] `A-01` conserve six étapes, reprend le même brouillon et sépare activation Agence de capacité FedaPay.
- [ ] `A-16` protège le dernier ADMIN actif et gère le conflit concurrent.
- [ ] `X-06` exige MFA TOTP Supabase `aal2` mais aussi un `PlatformMembership` autorisé ; retour à l’action avec version relue.
- [ ] `S-01` suspend/réactive seulement avec autorité plateforme, MFA frais, motif et confirmation.

## 18. Definition of Done DESIGN

Le DESIGN est implémenté lorsque :

- tous les écrans de l’inventaire existent ou ont une décision de non-affichage justifiée par rôle ;
- les composants partagés sont documentés dans le catalogue UI avec états et accessibilité ;
- les parcours critiques du PRD passent visuellement et fonctionnellement sur la matrice responsive ;
- aucun contexte ne reçoit une donnée financière interdite ;
- les textes normatifs de paiement, notification et support sont respectés ;
- les contrôles automatisés d’accessibilité passent et une revue manuelle complète les résultats ;
- aucune violation connue des critères WCAG 2.2 A/AA applicables ne reste ouverte ;
- les captures de référence mobile et desktop sont attachées aux revues de fonctionnalité ;
- le parcours Google en une action et le repli OTP e-mail sont testés pour Locataire, création d’Agence, invitation et compte multi-contexte sans privilège automatique ;
- les trois portes d’accès sont visibles directement et mènent à la même authentification Supabase sans modifier les permissions ;
- le parcours Agence de disponibilité et le point mensuel Propriétaire couvrent sélection en lot, date serveur, correction, remboursement et WhatsApp ;
- aucun écran Propriétaire ne représente un reversement, un retrait, un solde restant ou une preuve de remise ;
- aucune fonctionnalité exclue n’apparaît dans la navigation, les états vides ou les actions secondaires.
