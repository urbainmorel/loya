# S0-004 — POC OQ-002 Worker → Data API/RLS

Statut : **IMPLÉMENTÉ, PREUVE CI EN ATTENTE — OQ-002 OUVERTE**. Date : **2026-08-27**.

Ce document décrit une expérience technique bornée. Il ne crée ni règle produit, ni règle de sécurité, ni choix d'architecture définitif. Les seules sources normatives restent le PRD, le STI, le DESIGN, la ROADMAP et la maquette Locataire.

## Objectif

Le STI exige à la fois que les commandes passent par le Worker et que les appels utilisateur conservent le JWT Supabase afin que `auth.uid()` et la RLS restent actifs (STI, l. 44–50 et 440–470 ; ROADMAP, l. 159–168 et 277–284). `OQ-002` demande quel transport satisfait ces deux contraintes.

Le POC vérifie uniquement la proposition suivante en lecture :

1. un utilisateur local est authentifié par Supabase Auth avec le flux magic link ;
2. le Worker valide le Bearer auprès de `GET /auth/v1/user` et contrôle que `user.id` est un UUID ;
3. le Worker transmet le même Bearer et une clé Supabase publiable à une RPC étroite du schéma `api` ;
4. la RPC `SECURITY INVOKER` utilise `auth.uid()` et une table `private` sous `FORCE ROW LEVEL SECURITY` ;
5. deux utilisateurs et un utilisateur sans rattachement reçoivent uniquement leur projection autorisée.

## Périmètre jetable

Les fichiers du POC sont isolés dans `apps/worker/poc/oq-002`. Le DDL n'est pas une migration, n'est pas chargé par le Worker de production et doit échouer si les schémas ou le rôle réservés existent déjà. Il est exécuté uniquement sur la base Supabase locale jetable d'un runner GitHub.

Le harnais crée ses trois identités par l'API Admin GoTrue locale. La clé `service_role` locale est masquée et limitée à la création des fixtures et à la génération des magic links ; elle n'est jamais injectée dans le Worker, le bundle web ou le SQL applicatif. Les JWT sont obtenus par `/auth/v1/admin/generate_link` puis `/auth/v1/verify`, sans chemin de connexion par mot de passe.

```text
GitHub runner
  ├─ Supabase local : Kong → GoTrue / PostgREST → PostgreSQL
  ├─ Worker Hono local : Bearer → /auth/v1/user → UUID
  │                     même Bearer + clé publiable → RPC api
  └─ client de test : magic link → Worker → assertions RLS
```

## Contrôles automatisés

Huit assertions SQL vérifient :

- le propriétaire `NOLOGIN`, `NOINHERIT`, non privilégié et sans `BYPASSRLS` ;
- la propriété des schémas, de la table et de la fonction ;
- `ENABLE RLS` et `FORCE RLS` ;
- une RPC `STABLE`, `SECURITY INVOKER` et `search_path` vide ;
- l'absence de grant RPC pour `anon` et `service_role` ;
- les seuls grants nécessaires pour `authenticated`, sans lecture de `subject_id` ni DML ;
- la projection exacte de l'utilisateur A sous `auth.uid()` ;
- l'application de la RLS au propriétaire de la table sans JWT.

Le test HTTP réel couvre neuf observations : Bearer absent, utilisateur A, utilisateur B avec une ressource située dans l'agence A, utilisateur sans rattachement, jeton `anon`, signature JWT altérée, schéma `private` refusé avec `PGRST106`, appel RPC direct et tentative d'ajouter `subject_id` refusée avec `PGRST202`.

Les réponses d'erreur du Worker sont neutres. Les corps d'erreur amont sont annulés, la projection Data API valide est diffusée sans copie, et les réponses portent `no-store`. Les diagnostics publiés par GitHub passent par la redaction testée des URI PostgreSQL, JWT, clés Supabase et headers d'autorisation. Cette preuve porte sur la sortie publiée après redaction ; elle ne prétend pas qu'aucun secret ne puisse atteindre un journal brut temporaire du runner.

## Limite confirmée

Le test direct de la RPC réussit avec la même clé publiable et le même JWT utilisateur. C'est le comportement attendu de PostgREST et de la RLS, mais cela démontre qu'une RPC accordée à `authenticated` n'est pas techniquement réservée au Worker.

Le POC ne permet donc pas de conclure que « toutes les commandes passent par le Worker » signifie une frontière impossible à contourner. Deux interprétations restent à décider :

- le Worker est la route canonique, tandis que chaque RPC reste sûre même appelée directement grâce à `auth.uid()`, la RLS, l'idempotence, l'audit et ses contrôles internes ;
- le Worker doit être une frontière techniquement obligatoire, auquel cas un mécanisme d'attestation ou un autre transport doit être choisi et prouvé sans désactiver la RLS utilisateur.

Cette décision ne peut pas être inventée par l'implémentation. `OQ-002` reste donc ouverte.

## Ce que le POC ne prouve pas

- aucune mutation, transaction multi-écriture, idempotence, concurrence, audit métier ou rollback ;
- aucune migration de production ni matrice complète Agence/Locataire/Propriétaire/Plateforme ;
- aucune politique Storage, Queue, R2, FedaPay ou MFA ;
- aucun comportement de l'environnement Supabase distant ;
- aucune frontière Worker-only pour une RPC accessible à `authenticated` ;
- aucune clôture de `S0-004`, `S1-004`, `OQ-002` ou `OQ-010`.

## Exécution et critères de preuve

Les contrôles sans conteneur se lancent localement avec :

```text
pnpm check
pnpm audit --audit-level high
```

Conformément aux instructions du dépôt, le démarrage Docker/Supabase et le test de bout en bout sont exclusivement exécutés dans `.github/workflows/s0-quality.yml`. Une preuve verte exige le succès du check GitHub obligatoire sur le commit documenté. Jusqu'à ce résultat, le statut reste **PREUVE CI EN ATTENTE**.

Après une CI verte, ce document devra enregistrer le run et le commit exacts sans modifier la conclusion : chaîne de lecture prouvée, limite Worker-only confirmée, mutation et clôture d'`OQ-002` toujours non prouvées.
