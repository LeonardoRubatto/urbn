# L’Urbaine Paris — site

Site statique de L’Urbaine Paris (association et média étudiant de Paris Dauphine – PSL).

- `content/` : tout le contenu (réglages, projets, médias, équipe). C’est ici qu’on publie.
- `media/` : photos et vidéos d’origine.
- `src/` : gabarits (`templates/`), styles (`css/`), scripts (`js/`), fichiers fixes (`static/`).
- `functions/assets/video/` : petite fonction Cloudflare qui sert les vidéos par morceaux (réponse 206). Sans elle, Safari (iPhone) ne lit pas les vidéos : Cloudflare renvoie sinon le fichier entier. Ne pas supprimer.
- `scripts/` : `build.mjs` (génère `dist/`), `media.mjs` (images et vidéos web), `lib/content.mjs`.
- `dist/` : le site généré, versionné avec le reste. `npm run build` le recrée ; `dist/index.html` s’ouvre aussi par double-clic. Cloudflare Pages (projet `urbndauphine`) publie ce dossier, d’après `wrangler.toml`. Sur GitHub, l’action `.github/workflows/site.yml` le régénère et le recommite quand le contenu change. Fichiers publiés : 25 Mio au plus chacun (les films trop lourds sont recompressés automatiquement).

`npm ci` puis `npm run build` et `npm run check`. Mode d’emploi : `GUIDE-PUBLICATION.md`. Pour un assistant : `AI-INSTRUCTIONS.md`.
