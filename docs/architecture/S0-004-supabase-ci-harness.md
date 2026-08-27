# S0-004 — Harnais Supabase local et catalogue RLS

- Statut : **HARNAIS IMPLÉMENTÉ — RLS LOYA NON PROUVÉE**
- Date : **2026-08-27**
- Porte : **`GATE-0` reste rouge**

Ce document consigne un incrément de test, pas une règle métier supplémentaire. Les seules sources normatives restent le PRD, le STI, le DESIGN, la ROADMAP et la maquette Locataire identifiés dans [GATE-0](../gates/GATE-0.md).

## Objectif borné

Le harnais est conçu pour prouver dans le job GitHub obligatoire qu'une base Supabase locale réelle peut démarrer, être remise à zéro et exécuter pgTAP. Il vérifie aussi statiquement que `supabase/config.toml` active la Data API en déclarant uniquement `api`, et que les sources comme le bundle web ne contiennent aucun marqueur ou JWT de rôle Supabase privilégié. La preuve distante doit être consignée seulement après une exécution réussie.

Il ne crée aucune migration, table, vue, policy, fonction, RPC ou grant Loya. Les choix Worker → SQL (`OQ-002`), atomicité outbox/Queues (`OQ-010`) et rollback (`OQ-011`) restent ouverts ; les cacher dans du DDL de production serait contraire au cadrage.

## Preuve exécutable

Docker s'exécute uniquement dans GitHub Actions, conformément aux instructions du dépôt. Le job `Quality and secrets` utilise la CLI Supabase verrouillée dans `pnpm-lock.yaml`, démarre uniquement PostgreSQL, rejoue l'état local avec `db reset`, exécute `supabase/tests/database` avec pgTAP, puis détruit le volume local.

Le test `platform_smoke.test.sql` vérifie seulement la plateforme : extension pgTAP, schéma `auth`, table `auth.users`, puis présence, type UUID et clé primaire de `auth.users.id`. Il ne compte pas comme test RLS Loya et ne peut pas verdir `S0-004`.

## Catalogue allow/deny à matérialiser

Les cas suivants viennent de la ROADMAP §S0-004 et du STI §7.3/§18.3. Ils restent **NON PROUVÉS** jusqu'à une décision sur les questions bloquantes, une migration dédiée et un test comportemental réel.

| Cas obligatoire                                                       | Résultat attendu                                                      | État       |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------- |
| Agence A lit ou modifie une ressource de A autorisée                  | allow selon rôle et contexte actifs                                   | NON PROUVÉ |
| Agence A vise une ressource de l'Agence B                             | deny                                                                  | NON PROUVÉ |
| Locataire A vise les données du Locataire B dans la même Agence       | deny                                                                  | NON PROUVÉ |
| Propriétaire A vise les données du Propriétaire B dans la même Agence | deny                                                                  | NON PROUVÉ |
| Contexte déclaré sans rattachement actif                              | deny                                                                  | NON PROUVÉ |
| Utilisateur ou adhésion inactifs                                      | deny                                                                  | NON PROUVÉ |
| Requête `anon` sur une donnée privée                                  | deny                                                                  | NON PROUVÉ |
| Schéma `private` demandé via Data API                                 | inaccessible                                                          | NON PROUVÉ |
| Commande utilisateur traverse le Worker                               | même `auth.uid()` jusqu'à PostgreSQL                                  | NON PROUVÉ |
| UUID d'un tiers substitué dans l'entrée                               | deny                                                                  | NON PROUVÉ |
| Fonction privilégiée strictement bornée                               | owner `NOLOGIN`, `search_path=''`, noms qualifiés et contrôle interne | NON PROUVÉ |

## Critères avant extension

1. Fermer explicitement `OQ-002`, `OQ-010` et `OQ-011` lorsque leurs choix deviennent indispensables.
2. Ajouter les migrations de production seulement après ces décisions, avec grants minimaux, `ENABLE/FORCE RLS`, revue de privilèges et fermeture par défaut.
3. Transformer chaque ligne du catalogue en pgTAP allow/deny avec plusieurs agences et plusieurs utilisateurs d'une même agence.
4. Ajouter lint/advisors sur les seuls schémas Loya une fois qu'ils existent ; le harnais actuel évite de qualifier les objets système Supabase comme s'ils étaient du code applicatif.

Jusque-là, [GATE-0](../gates/GATE-0.md) et la tâche `S0-004` restent **NON PROUVÉS**.
