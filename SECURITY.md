# Politique de sécurité

## Versions prises en charge

Seule la version courante de la branche `main` est prise en charge avant la première version stable.

## Signaler une vulnérabilité

N'ouvrez pas d'issue publique. Utilisez le formulaire privé **Report a vulnerability** dans l'onglet **Security** du dépôt. S'il n'est pas disponible, contactez `@urbainmorel` en privé sans publier de détail exploitable.

Le signalement doit contenir, si possible :

- le composant et l'environnement concernés ;
- l'impact observé ou potentiel ;
- les étapes minimales de reproduction ;
- une preuve expurgée de tout secret et de toute donnée personnelle ;
- une proposition de correction, si elle est connue.

Le mainteneur accusera réception, qualifiera le risque et coordonnera la correction et la divulgation. Ne testez pas sur des données ou comptes tiers et n'exfiltrez aucune donnée.

## Secret exposé

Un secret exposé doit être révoqué ou tourné immédiatement. Le retirer d'un commit ne suffit pas : considérez-le comme compromis et suivez le runbook d'incident avant de réécrire éventuellement l'historique.
