# Instructions pour un assistant (IA) qui travaille sur ce site

Tu arrives sur le site de L’Urbaine Paris (association et média étudiant de Paris Dauphine – PSL).
Lis ce fichier en entier, puis `GUIDE-PUBLICATION.md` (le mode d’emploi du contenu), puis un fichier existant
du même type que celui que tu vas créer. Le site est en français : écris en français, avec l’apostrophe typographique ’.

## 1. Comment le site est fait (en 30 secondes)

- **Contenu** dans `content/` (YAML et Markdown) et **fichiers d’origine** dans `media/`. C’est tout ce qu’on touche pour publier.
- `npm run build` fabrique le site dans `dist/` (pages HTML, images AVIF/WebP, boucles et films vidéo). `npm run check` vérifie tout.
- Le site est **100 % statique** : pas de serveur, pas de base de données. `dist/index.html` s’ouvre par double-clic.
- **Une seule branche `main`**, qui fait foi : sources + `dist/` + `wrangler.toml`. Cloudflare Pages (projet `urbndauphine`)
  publie `dist/` à chaque push. Si on modifie le contenu sur GitHub sans régénérer, l’action `.github/workflows/site.yml`
  régénère `dist/` et le recommite.
- Le dépôt ne contient que ce qui sert au site (`.gitignore` en liste blanche). N’y ajoute ni notes de travail, ni captures, ni fichiers d’agent.

## 2. Demandes courantes → fichier à modifier

| Demande | Source à modifier |
| --- | --- |
| Ajouter ou corriger un projet | `content/projets/<nom>.md` (modèle : `_modeles/projet.md`) |
| Ajouter une photo, une vidéo, une boucle, un film | fichier dans `media/` + entrée dans `content/medias.yml` |
| Annoncer un évènement (prochaine date sur la couverture) | `date`, `lieu`, `edition` du projet |
| Couverture, « À la une », pôles, trailer, bandeau, mur « Avec », familles | `content/site.yml` |
| Nouvelle édition d’un évènement (DAU’Clash 9…) | le **même** fichier de projet : `date`, `lieu`, `edition`, `affiche`, nouveaux films en tête (GUIDE, « Cas fréquents ») |
| Bureau, présentation, pôles du Collectif, recrutement | `content/equipe.yml` (nouveau mandat : GUIDE, « Cas fréquents ») |
| Couleur des dates | `--date` dans `src/css/01-tokens.css` |
| Email, Instagram, mentions légales, ouverture à Google | `content/site.yml` |

Tous les champs sont expliqués dans `GUIDE-PUBLICATION.md`.

## 3. Avant d’agir : demande ce qui manque

Pour un nouveau projet, il te faut au minimum : le titre, la famille, une phrase de résumé validée, la date (et l’heure si
c’est à venir), le lieu, les fichiers d’origine (pas des captures ni des vignettes Instagram), le crédit de chaque fichier
et le lien de la publication d’origine. S’il manque un élément, **demande-le** avant d’écrire. De même pour un nom ajouté
à « Avec » : il faut son rôle et la publication qui le cite (`projet` est facultatif). Pour une vidéo, demande quel
passage mettre en boucle si ce n’est pas évident (sinon propose deux ou trois passages avec leur seconde de début).

## 4. Ce que tu fais

1. Intègre les fichiers dans `media/`, déclare-les dans `content/medias.yml` avec un texte `alt` factuel (ce qu’on voit).
2. Choisis le `gel` (couleur de lumière) avec `npm run gel -- <fichier> [début durée]` sur l’affiche ou le passage de la boucle ;
   l’outil garde L entre 0.55 et 0.88. Vérifie à l’œil : c’est la lumière du projet, pas forcément sa couleur la plus présente.
3. Range le projet : `ordre` (le plus petit en premier) ; `accueil: true` seulement pour 5 à 7 projets récents avec une `boucle`.
4. `npm run build` puis `npm run check` : les deux doivent finir sans erreur.
5. Vérifie (section 8), puis commite **avec `dist/`**.
6. Ne pousse sur `main` que si une personne autorisée l’a demandé : le push met le site en ligne.

## 5. Ce que tu ne fais pas

- Tu n’inventes ni dates, ni citations, ni résultats, ni noms, ni collaborations : tout vient des publications de L’Urbaine ou du bureau.
- Tu ne modifies pas un fichier de `dist/` à la main (il est recréé par `npm run build`).
- Tu ne renommes pas un projet déjà publié (son adresse changerait).
- Tu ne publies pas une photo sans l’accord des personnes visibles (à confirmer auprès du bureau).
- Tu ne modifies pas le style (`src/css`) ni les scripts (`src/js`) pour une simple mise à jour de contenu.
- Tu ne supprimes pas `functions/` ni `wrangler.toml` (voir section 9).

## 6. Direction artistique — à respecter si on te demande de modifier l’apparence

Le concept : **une salle noire et un projecteur**. Chaque projet est éclairé par la couleur de lumière (« gel ») mesurée
sur ses propres vidéos ; le nom URBAINE PARIS est « projeté » en lignes empilées de largeurs différentes.

- Fond noir de salle (`--salle`), texte blanc froid, jaune réservé aux dates et repères, rouge seulement pour le point du logo.
  **Jamais de fond crème ou « papier »** (jugé « IA » par le client).
- Police unique : **Archivo variable** (graisse 100–900, largeur 62–125). Titres étroits (largeur 62, graisse 900, capitales) ;
  noms de personnes en « Prénom » régulier + « NOM » étendu noir. L’effet d’élargissement au survol est une signature : on le garde.
- La couleur vient des images : le gel est une lumière (faisceau translucide, couleur de lettre), jamais un aplat de section.
- Asymétrie partout : rien de centré par défaut, pas de grilles de cartes égales, pas de pastilles, pas de points de couleur décoratifs.
- Pas de texte de remplissage (« bullshit ») : chaque phrase vient des publications ou dit une information.
- Pas de boîtes sous les légendes posées sur une photo ; contraste par ombre portée légère.

**Choix validés par le client — ne pas les défaire :**
- Couverture : grand décor URBAINE PARIS pleine largeur sur les vidéos ; onglets en simples titres étroits (pas de barres,
  pas de boîte, pas de bouton pause visible), l’onglet actif prend la couleur de sa vidéo ; ligne d’identité au-dessus des onglets.
- « À la une » (composition décalée d’origine) : index à gauche, plan photo découpé en biais, affiche qui traverse ;
  le bouton du dossier est aligné sur la ligne du titre du dossier.
- Séquence des projets de l’accueil : scène vidéo fixe + titres qui défilent, sur ordinateur **et** téléphone ; cadrage
  légèrement irrégulier différent pour chaque vidéo ; **ne pas ajouter de barres de progression** ni atténuer les projets.
- Cinq pôles : boucles verticales du reel, entrée en rideau sur ordinateur.
- « Avec » : générique de film. Sur ordinateur, **texte continu décalé à droite** : les noms se coupent où la ligne finit
  (tailles inégales, rôle en petit après chaque nom) ; **ne pas aligner un nom par ligne à gauche**. Sur téléphone seulement,
  chaque nom + rôle forme un bloc qui passe à la ligne entier. Jamais de grille ni de points.
- Téléphone : la couverture remplit l’écran (`100dvh`) ; les sections ont leur propre mise en page, pas une colonne compressée.

## 7. Carte du code (si on te demande de modifier l’apparence ou le fonctionnement)

**Gabarits** (`src/templates/`, fonctions JavaScript qui renvoient du HTML) :
- `layout.mjs` : `<head>`, en-tête, pied de page (crédit « Site par Telaventis » centré, à garder), salle de projection des films.
- `components.mjs` : `picture` (image responsive), `loop` (boucle vidéo), `cover` (boucle ou affiche d’un projet), `filmButton`,
  `decor` (mot empilé ajusté à la largeur), `figure` (mot fantôme + faisceau en fond), `bureau`, `collaborations` (« Avec »), `contact`, `ticket` (bouton billet).
- `pages/home.mjs` : accueil = `couverture` (décor + vidéos) → `couvertureDecalee` (« À la une ») → `poles` → `tableaux` (séquence des projets)
  → `collaborations` → `multicam` (trailer) → `bande` (photos qui défilent) → `bureau` → `contact`. `couverture_style` dans `site.yml` inverse les deux premières.
- `pages/projets.mjs` (liste, filtres, calendrier), `pages/projet.mjs` (fiche), `pages/collectif.mjs` (Collectif + mentions légales).
- Une nouvelle section = une fonction ici, appelée dans la page ; ses données dans `content/`.

**Styles** (`src/css/`, assemblés dans l’ordre alphabétique) : `01-tokens` (couleurs, police, espacements de 4 px, courbes),
`02-base`, `03-components`, `04-home`, `045-desk` (« À la une » et pôles), `05-pages` (pages + règles « mouvement réduit »), `06-figures`
(figures de fond, « Avec », entrée des pôles, rythme téléphone, transitions de mise en page).

**Scripts** (`src/js/`, assemblés dans l’ordre alphabétique, sans dépendance) : `01-base` (réglages, `setGel`), `02-loops` (les vidéos
en boucle ne se lancent qu’à l’écran, version légère sur téléphone), `03-decor` (ajuste chaque ligne du décor à la largeur), `04-plateau`
(tableaux de la couverture), `045-desk` (onglets « À la une »), `05-gel` (séquence des projets, couleur de lumière au défilement),
`055-reveal` (entrées de sections), `06-film` (lecture des films), `07-bande`, `08-filters`, `09-gallery` (visionneuse photo),
`10-curtain` (rideau entre les pages), `11-smooth` (quand un titre change de nombre de lignes, le bloc et les mots glissent).

**Génération** : `scripts/build.mjs` (pages + vérifications ; `--check` = vérifier sans écrire), `scripts/media.mjs` (images et vidéos ;
un média n’est refait que si son fichier ou ses réglages changent ; `npm run media -- --force` refait tout), `scripts/lib/content.mjs` (lecture de `content/`), `scripts/gel.mjs` (propose un gel mesuré sur une image ou une vidéo).

**Règles qui ne se voient pas à l’œil** : toute animation a sa version « mouvement réduit » ; tout élément interactif est utilisable
au clavier avec un contour visible ; zones cliquables ≥ 44 px ; aucun débordement horizontal (utiliser `overflow: clip`, jamais
`overflow: hidden` autour d’un élément `position: sticky`) ; pas de préchargement de police avec `crossorigin` (casse l’ouverture en double-clic).

## 8. Vérifier avant de livrer

1. `npm run build` puis `npm run check` (« tout est en ordre »).
2. Ouvre `dist/index.html` et la page touchée, à 390 px (téléphone) et 1440 px : rien ne déborde, les boucles tournent, les films se lancent,
   les textes ne chevauchent rien, la couleur de lumière suit le projet.
3. Si tu as touché aux interactions : clavier (Tab, Échap), et réglage système « réduire les animations ».
4. Après publication, vérifie l’adresse en ligne (https://urbndauphine.pages.dev). Pour les vidéos, la réponse à une demande partielle doit être 206 :
   `curl -s -o /dev/null -D - -H "Range: bytes=0-1" https://urbndauphine.pages.dev/assets/video/trailer-2026-studio.mp4` → `HTTP/1.1 206`.

## 9. Pièges déjà rencontrés (et leur solution, déjà en place)

- **Vidéos qui ne se lisent pas sur iPhone** : Cloudflare renvoie le fichier entier (200) au lieu d’un morceau (206), et Safari refuse.
  `functions/assets/video/[[path]].js` sert les vidéos par morceaux, en flux. Ne pas le supprimer ni charger les fichiers entiers en mémoire.
- **Fichier refusé par Cloudflare** : 25 Mio maximum par fichier publié. `scripts/media.mjs` recompresse les films au-delà de 24 Mio.
  Les vidéos d’origine de `media/` peuvent dépasser : elles ne sont pas publiées (seul `dist/` l’est, via `wrangler.toml`).
- **Cloudflare publie la racine du dépôt** si `wrangler.toml` disparaît : la publication échoue (fichiers de `media/` trop lourds).
- **Vidéos sans ffmpeg** : le build garde les vidéos déjà produites et signale les nouvelles manquantes. Installer ffmpeg (`winget install Gyan.FFmpeg`).
- **Couverture qui ne remplit pas l’écran du téléphone** : hauteur en `100dvh` (pas `100vh` seul).
- **« Prochaine date » qui reste affichée après l’évènement** : elle est calculée au build. Régénérer le site (ou pousser un changement) après la date.
- **Barres de progression, bouton pause, points de couleur** : retirés à la demande du client, il n’en reste rien dans le code. Ne pas les remettre.
