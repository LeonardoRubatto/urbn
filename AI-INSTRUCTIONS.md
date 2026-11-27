# Mettre à jour le site de L’Urbaine Paris (instructions pour un assistant)

Lis `GUIDE-PUBLICATION.md`, puis un fichier existant du même type, avant toute modification.

| Demande | Source à modifier |
| --- | --- |
| Ajouter ou corriger un projet | `content/projets/<nom>.md` (modèle : `_modeles/projet.md`) |
| Ajouter une photo, une vidéo, une boucle, un film | fichier dans `media/` + entrée dans `content/medias.yml` |
| Annoncer un évènement | `date`, `lieu`, `edition` du projet |
| Couverture, « À la une », pôles, trailer, bandeau | `content/site.yml` |
| Bureau, présentation, recrutement | `content/equipe.yml` |

## Avant d’agir : demande ce qui manque

Pour un nouveau projet, il te faut au minimum : le titre, la famille, une phrase de résumé validée, la date (et l’heure si c’est à venir), le lieu, les fichiers d’origine (pas des captures ni des vignettes Instagram), le crédit de chaque fichier et le lien de la publication d’origine. Si un de ces éléments manque, **demande-le** avant d’écrire. Pour une vidéo, demande aussi quel passage servir en boucle si ce n’est pas évident (sinon propose deux ou trois passages, avec leur seconde de début).

## Ce que tu fais

1. Intègre les fichiers fournis dans `media/`, déclare-les dans `content/medias.yml` avec un texte `alt` factuel.
2. Choisis le `gel` en mesurant la couleur dominante de la boucle ou de l’affiche (luminosité L entre 0.55 et 0.88).
3. Lance `npm run build` puis `npm run check`. Les deux doivent finir sans erreur.
4. Ouvre la page concernée et vérifie : boucle qui tourne, film qui se lance, crédits, texte alternatif, rendu à 390 px et 1440 px.
5. Ne pousse sur `main` que si une personne autorisée l’a demandé : le push met le site en ligne (l’action GitHub génère la branche `site`, publiée par Cloudflare Pages). Ne touche jamais à la branche `site`.

## Ce que tu ne fais pas

- Tu n’inventes ni dates, ni citations, ni résultats, ni noms : tout vient des publications de L’Urbaine ou du bureau.
- Tu ne modifies pas un fichier de `dist/` : il est recréé par `npm run build`.
- Tu ne renommes pas un projet déjà publié.
- Tu ne publies pas une photo sans l’accord des personnes visibles (à confirmer auprès du bureau).
- Tu ne modifies pas le style (`src/css`) ni les scripts (`src/js`) pour une simple mise à jour de contenu.

## Style et design (si on te demande de modifier l’apparence)

Jetons (couleurs, police, durées) : `src/css/01-tokens.css`. Gabarits : `src/templates/` (un composant = une fonction dans `components.mjs`, une page = un fichier dans `pages/`). Les fichiers de `src/css` et `src/js` sont assemblés dans l’ordre alphabétique. Après un changement : `npm run build` et `npm run check`, puis vérifier le rendu à 390 px et 1440 px.
