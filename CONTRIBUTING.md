# Contribuer à Loya

Les documents `PRD_Gestion_Locative_IA_V1.md`, `STI_Gestion_Locative_IA_V1.md`, `DESIGN_Gestion_Locative_IA_V1.md` et `ROADMAP_Gestion_Locative_IA_V1.md` sont les sources normatives. Une modification de règle produit ou financière doit être décidée et documentée séparément avant son implémentation.

## Flux Git

1. Ne jamais pousser directement sur `main`.
2. Créer une branche courte depuis `main` : `feat/...`, `fix/...`, `chore/...`, `docs/...`, `test/...` ou `security/...`.
3. Utiliser des commits conventionnels, par exemple `feat(payments): add quote validation`.
4. Ouvrir une petite pull request avec une responsabilité claire.
5. Obtenir une CI verte et l'approbation du CODEOWNER avant fusion.

Privilégier le squash merge afin que l'historique de `main` reste lisible.

## Validation locale

Les versions de référence sont Node.js `24.15.0` et pnpm `11.24.0`. Dès que le workspace existe :

```sh
pnpm install --frozen-lockfile
pnpm check:s0
```

La commande `check:s0` doit regrouper les contrôles déterministes requis par la CI. Une PR ajoute ou adapte les tests correspondant à son risque.

## Sécurité et données

- Ne jamais committer de secret, jeton, donnée de production ou donnée personnelle réelle.
- Signaler une vulnérabilité selon `SECURITY.md`, jamais dans une issue publique.
- Conserver les mutations financières côté serveur et leurs invariants dans PostgreSQL.
- Tester chaque règle RLS avec des cas autorisés et refusés.
- Appliquer expansion–contraction aux migrations et préserver la compatibilité N/N-1.
