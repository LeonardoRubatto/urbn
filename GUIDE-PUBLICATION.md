# Publier sur le site de L’Urbaine Paris

Le site est un dossier de fichiers statiques. Le contenu vit dans des fichiers simples (`content/`, en YAML et Markdown), les photos et vidéos d’origine dans `media/`. Les pages HTML, les images web et les vidéos compressées sont **générées** dans `dist/` : ne modifie jamais un fichier de `dist/` à la main, il serait écrasé.

| Je veux… | Je modifie | Les médias vont dans |
| --- | --- | --- |
| Ajouter un projet (soirée, format, fresque…) | `content/projets/nom-du-projet.md` (copie `_modeles/projet.md`) | `media/images/`, `media/videos/` + `content/medias.yml` |
| Annoncer une date (prochain DAU’Clash…) | `date`, `lieu`, `edition` du projet | |
| Ajouter une photo ou une vidéo | `content/medias.yml` (une entrée par fichier) | `media/images/` ou `media/videos/` |
| Ajouter un extrait vidéo en boucle | `boucles` de la vidéo dans `content/medias.yml` | |
| Rendre une vidéo lisible en entier sur le site | `film: true` dans `content/medias.yml` | |
| Changer les publications « À la une » | `une` dans `content/site.yml` | |
| Changer les trois tableaux de la couverture | `couverture` dans `content/site.yml` (titre, boucle, gel, projet) | |
| Ajouter un collaborateur au mur « Avec » | `collaborations` dans `content/site.yml` (nom, rôle, projet) | |
| Le calendrier de la page Projets | rien : il se remplit avec les `date` des projets | |
| Choisir la couverture (décor projeté ou composition décalée) | `couverture_style` dans `content/site.yml` | |
| Changer les pôles, le trailer, le bandeau photo | `poles`, `multicam`, `bandeau` dans `content/site.yml` | |
| Nouveau bureau | `content/equipe.yml` | `media/images/` |
| Email, Instagram, mentions légales | `content/site.yml` | |
| Ouvrir le site à Google | `prive: false` dans `content/site.yml` | |

## Après chaque modification

1. `npm run build` : crée les images web (AVIF + WebP en plusieurs tailles), les boucles et les films, puis les pages. Seuls les médias nouveaux ou modifiés sont refaits.
2. `npm run check` : vérifie tout (champ manquant, image non déclarée, fichier introuvable, lien cassé, texte alternatif absent). Il doit finir par « tout est en ordre ».
3. Ouvre `dist/index.html` (double-clic) et la page concernée.
4. Pousse sur `main` (avec `dist/`) : Cloudflare Pages publie `dist/` en quelques minutes. Si tu modifies le contenu directement sur GitHub, l’action `.github/workflows/site.yml` régénère `dist/` et le recommite, puis Cloudflare publie.

Première installation sur une machine : Node.js 20 ou plus, puis `npm ci`. Pour les vidéos : ffmpeg (`winget install Gyan.FFmpeg`). Sans ffmpeg, le site se génère quand même avec les vidéos déjà produites ; seules les nouvelles vidéos manquent (le build le signale).

## Un projet

Crée `content/projets/nom-en-minuscules-sans-accent.md` en copiant `_modeles/projet.md`. Le nom du fichier devient l’adresse de la page (`nom.html`) : **ne le change plus une fois publié**.

Champs (entre les deux lignes `---`) :

- `titre` (obligatoire) : « DAU’Clash ».
- `famille` (obligatoire) : `scene`, `soiree`, `format`, `murs` ou `vie` (liste et noms dans `familles` de `content/site.yml` ; ajouter une famille là-bas crée un nouveau filtre).
- `genre` : sous-titre court, « Rap battle et éloquence ».
- `resume` (obligatoire) : une phrase, utilisée sur l’accueil, la page Projets et pour Google.
- `gel` (obligatoire) : la couleur de lumière du projet, `"oklch(L C H)"`. Prends-la sur la vidéo ou la photo principale : bleu de l’amphi `oklch(0.56 0.24 266)`, vert du club `oklch(0.86 0.2 156)`, rouge `oklch(0.6 0.17 18)`. Garde L entre 0.55 et 0.88 pour qu’elle se lise sur le noir.
- `date` : `2026-12-02` ou avec l’heure `2026-12-02T18:45`. **Une date à venir fait apparaître le projet en « Prochaine date » sur la couverture** ; le lendemain, il redevient un projet passé au prochain build. `date_affichee` remplace l’affichage (« 2022 »).
- `lieu`, `edition` (« 8e édition », « #1 »).
- `boucle` : l’extrait vidéo de couverture, `vidéo#nom` (voir plus bas). Sinon `affiche`.
- `affiche` : une image (clé de `content/medias.yml`). Si le projet a une boucle **et** une affiche, l’affiche traverse la photo dans « À la une ».
- `films` : liste de vidéos lisibles en entier (elles doivent avoir `film: true`).
- `photos` : liste d’images pour la galerie (ordre d’affichage).
- `sources` : liens vers les publications d’origine, `{ texte: …, url: … }`.
- `ordre` : position dans les listes (1 = en premier). `accueil: true` : le projet apparaît dans « Les projets » de l’accueil.
- `page: false` + `lien` : un projet sans page, qui renvoie ailleurs (Instagram).
- `brouillon: true` : garde le fichier hors du site.

Le texte du projet s’écrit sous le second `---`, en paragraphes séparés par une ligne vide. Une citation (la légende d’un post, par exemple) s’écrit `> texte` : elle s’affiche en jaune.

## Une photo ou une vidéo

1. Dépose le fichier original, en **la meilleure qualité disponible**, dans `media/images/` (JPG, PNG, WebP) ou `media/videos/` (MP4). Nom simple, sans espace ni accent.
2. Déclare-le dans `content/medias.yml` :

```yaml
images:
  urnight-2027-foule:
    fichier: urnight-2027-foule.jpg
    alt: "Ce qu’on voit sur la photo, pour les personnes qui ne la voient pas"
    credit: Channel 9 Dauphine
    source: https://www.instagram.com/p/…
    cadrage: "50% 30%"      # facultatif : le point à garder quand l’image est recadrée

videos:
  urnight-2027-retour:
    fichier: urnight-2027-retour.mp4
    titre: C’était l’UR’Night 2027
    credit: Channel 9 Dauphine · L’Urbaine Paris
    source: https://www.instagram.com/reel/…
    film: true              # lisible en entier sur le site (avec le son)
    affiche: 12             # seconde utilisée comme image d’attente du film
    boucles:
      foule: { debut: 30.5, duree: 6, alt: "Le dancefloor sous une lumière rouge" }
```

Une **boucle** est un extrait muet de 2 à 7 secondes qui tourne en boucle (couvertures, pôles, multicam). On y renvoie par `urnight-2027-retour#foule`. Choisis un passage sans coupure brutale ni texte important qui disparaît. Les boucles ne se lancent qu’à l’écran, jamais si la personne a demandé de réduire les animations.

**Droit à l’image.** Une photo n’est publiée qu’avec l’accord des personnes visibles. Pour retirer une photo : retire sa clé des projets et de `content/site.yml`, puis son entrée dans `content/medias.yml`.

## Récupérer les médias depuis Instagram

Les vignettes affichées par Instagram sont petites (360 à 640 px) : ne les utilise pas. Demande les fichiers d’origine à la personne qui a posté, ou à Channel 9 pour leurs tournages. À défaut, la page d’une publication contient l’image en pleine taille (jusqu’à 1440–3000 px) et la vidéo en 720p ; c’est ainsi qu’ont été obtenus les fichiers de `media/` (le lien d’origine de chacun est dans `content/medias.yml`).

## Les réglages du site (`content/site.yml`)

- `nom`, `baseline`, `fondation` : identité, reprise dans la couverture, le pied de page et les métadonnées.
- `adresse_site` : l’adresse publique (https://urbndauphine.pages.dev ou un futur nom de domaine) ; elle sert aux liens de partage et au sitemap.
- `prive: true` : le site reste invisible pour Google (`noindex`, `robots.txt` fermé). Mettre `false` le jour de l’ouverture.
- `contact` : `email`, `instagram`, `instagram_nom`.
- `couverture_style` : `plateau` (décor projeté en couverture, puis « À la une ») ou `decale` (l’inverse). L’autre version reste visible sur `variante.html`.
- `couverture` : les trois tableaux vidéo de la couverture, chacun `{ titre, boucle, gel, projet }` (titre court affiché dans les onglets).
- `une` : les projets de « À la une », dans l’ordre de l’index (noms de fichiers de `content/projets/`).
- `poles` : `titre`, `texte`, `film` (la vidéo complète), `boucles` (liste de `{ nom, boucle }`, une boucle verticale par pôle).
- `multicam` : le trailer en mur de caméras : `titre`, `film`, `texte`, `boucles` (quatre boucles).
- `bandeau` : deux listes d’images (clés de `medias.yml`) qui défilent en sens opposés.
- `collaborations` : le générique « Avec », chacun `{ nom, role, projet }`. Seulement des collaborations citées dans une publication ou une source.
- `familles` : les familles de projets et leur nom affiché (elles deviennent les filtres de la page Projets).
- `mentions` : éditeur, direction de la publication, hébergeur (page Mentions légales).

## L’équipe (`content/equipe.yml`)

- `mandat` (« 2026–2027 »), `annonce` (lien de la publication du bureau), `photo_groupe`, `merci` (phrase reprise de l’annonce).
- `bureau` : une ligne par personne `{ prenom, nom, role, photo, succede }`. Pour un nouveau mandat : changer `mandat`, `annonce`, la photo de groupe et la liste.
- `presentation` : les paragraphes de la page Collectif (mots de l’association). `film_famille` : la vidéo de présentation.
- `poles` : les mots affichés en grand sur la page Collectif. `recrutement` : la phrase de la section « Rejoindre ».

## Règles

- Les textes reprennent les mots de L’Urbaine (légendes des posts) ou sont validés par le bureau. Un assistant peut intégrer des fichiers, remplir les champs, écrire un texte alternatif factuel ; il n’invente pas de faits, de dates ni de citations.
- Chaque image et chaque vidéo garde son crédit visible et un lien vers sa publication d’origine.
- Ne change pas le nom d’un fichier de projet déjà publié (l’adresse de la page changerait).
- Le style et les scripts (`src/`) ne se modifient pas pour une simple mise à jour de contenu.
