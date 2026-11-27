# L’Urbaine Paris — site

Site statique de L’Urbaine Paris (association et média étudiant de Paris Dauphine – PSL).

- `content/` : tout le contenu (réglages, projets, médias, équipe). C’est ici qu’on publie.
- `media/` : photos et vidéos d’origine.
- `src/` : gabarits (`templates/`), styles (`css/`), scripts (`js/`), fichiers fixes (`static/`).
- `scripts/` : `build.mjs` (génère `dist/`), `media.mjs` (images et vidéos web), `lib/content.mjs`.
- `dist/` : le site généré (absent du dépôt). En local, `npm run build` le crée et `dist/index.html` s’ouvre par double-clic ; sur GitHub, l’action `.github/workflows/site.yml` le génère à chaque push sur `main` et le dépose sur la branche `site`, que Cloudflare Pages publie telle quelle. Ne jamais modifier la branche `site` à la main. Fichiers publiés : 25 Mio au plus chacun (les films trop lourds sont recompressés automatiquement).

`npm ci` puis `npm run build` et `npm run check`. Mode d’emploi : `GUIDE-PUBLICATION.md`. Pour un assistant : `AI-INSTRUCTIONS.md`.
