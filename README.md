# Loya

Loya V1 est une PWA SaaS mobile-first de gestion locative. Le projet suit six portes de qualité successives ; aucune porte rouge n'est contournée.

## Statut

`GATE-0 — décisions et preuves` est en cours. Le squelette applicatif, les migrations et les flux financiers restent volontairement bloqués tant que les ambiguïtés normatives et validations externes consignées dans [GATE-0](docs/gates/GATE-0.md) ne sont pas closes.

## Sources normatives

- [PRD](PRD_Gestion_Locative_IA_V1.md)
- [STI](STI_Gestion_Locative_IA_V1.md)
- [DESIGN](DESIGN_Gestion_Locative_IA_V1.md)
- [ROADMAP](ROADMAP_Gestion_Locative_IA_V1.md)
- [Maquette Locataire](maquette%20%C3%A9crans%20locataire.png)

Leurs empreintes sont figées dans [docs/normative-manifest.json](docs/normative-manifest.json). Toute évolution doit être explicitement validée et mettre à jour la traçabilité.

## Contrôles locaux

Prérequis : Node.js `24.15.0` et pnpm `11.24.0`.

```bash
pnpm check:s0
```

Ce contrôle vérifie les empreintes normatives, la traçabilité, le périmètre verrouillé et les tests du Sprint 0.

## Contribution

Les commits directs sur `main` sont interdits. Toute modification passe par une branche courte, une pull request, les checks obligatoires et la revue CODEOWNERS. Voir [CONTRIBUTING.md](CONTRIBUTING.md).
