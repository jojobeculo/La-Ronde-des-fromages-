# Le Buron — fromagerie artisanale, Clermont-Ferrand

Site vitrine d’une seule page, très animé, inspiré de l’univers éditorial de Graza : fonds crème, encre olive, bandeaux moutarde et vert prairie, grands titres serif condensés et texte « machine à écrire ».

![Aperçu du site](assets/img/og-image.jpg)

## Ce que contient la page

| Section | Effets |
|---|---|
| Préchargement | Meule qui tourne, compteur 0 → 100 %, rideau qui se lève |
| Hero (paysage de la chaîne des Puys) | Décor en couches qui monte au chargement, soleil levant derrière le Puy de Dôme, fumée, vaches, gentianes qui ondulent ; parallaxe à la souris et au défilement (les collines « avalent » le titre) |
| Bandeau défilant | Noms des fromages en continu ; la vitesse, le sens et l’inclinaison suivent le défilement |
| Manifeste | Les mots s’allument un à un au défilement, pastilles illustrées, badge tournant, compteurs animés |
| Les cinq AOP | Section épinglée à défilement horizontal, cartes qui changent de couleur et « s’entament » au survol |
| De l’estive au comptoir | Cadre collant dont la scène change à chaque étape (révélation circulaire) |
| Composez votre plateau | Calculateur : nombre de convives et occasion → quantité conseillée, sélection de fromages (nombre impair) et plateau dessiné en direct ; bouton de commande par e-mail pré-rempli |
| Nuage de mots | Les verbes s’assemblent, suivent la souris, l’ovale se dessine autour de « Partager » |
| Accords | Lignes qui se remplissent au survol, carte du fromage qui suit le curseur |
| Recettes | Illustrations animées au survol (la tomme file, la poêle tourne…), fiches complètes en fenêtre |
| Nous trouver | Statut **ouvert / fermé en direct** (heure de Paris), jour courant surligné, devanture dont la porte s’ouvre au survol |
| Pied de page | Silhouette de la chaîne des Puys, logotype géant qui monte lettre par lettre |

Partout : défilement fluide, curseur personnalisé avec libellés (« Goûter », « Miam », « Entrer »), boutons magnétiques, textes qui roulent au survol, titres révélés ligne par ligne, grain imprimé.

Le site respecte le réglage système « réduire les animations » et reste entièrement lisible sans JavaScript.

## Voir le site en local

Aucune installation nécessaire, c’est un site statique :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Mettre en ligne

N’importe quel hébergement de fichiers statiques convient :

- **GitHub Pages** : *Settings → Pages → Deploy from a branch*, choisir la branche et le dossier racine.
- **Netlify** : glisser-déposer le dossier du projet sur [app.netlify.com/drop](https://app.netlify.com/drop).
- Ou tout hébergeur classique (OVH, o2switch…) en envoyant les fichiers par FTP.

## À personnaliser avant la mise en ligne

Tout est dans `index.html` ; les endroits à modifier sont signalés par `✏️ À PERSONNALISER`.

- [ ] **Adresse** : remplacer `[Numéro et rue]` (section « Nous trouver » et pied de page).
- [ ] **Téléphone** : remplacer `04 XX XX XX XX` et les liens `tel:+33400000000`.
- [ ] **E-mail** : remplacer `contact@example.com` (attribut `data-email` du bouton « Commander ce plateau » et liens `mailto:`).
- [ ] **Horaires** : dans le tableau des horaires, mettre à jour le texte affiché **et** l’attribut `data-hours` de chaque jour (`HH:MM-HH:MM`, plusieurs plages séparées par une virgule, vide = fermé). Le statut « ouvert / fermé » se calcule à partir de ces attributs.
- [ ] **Textes** : relire les services (plateaux, raclette, coffrets, mariages…), les accords et les recettes, et les adapter à ce que propose réellement la boutique.
- [ ] **Image de partage** : dans `<head>`, remplacer `assets/img/og-image.jpg` par l’adresse complète une fois le site en ligne (ex. `https://www.mon-domaine.fr/assets/img/og-image.jpg`).
- [ ] **Mentions légales** : obligatoires pour un site professionnel en France (raison sociale, SIRET, hébergeur…). À ajouter, par exemple dans le pied de page.
- [ ] **Réseaux sociaux** : ajouter les liens Instagram / Facebook dans le pied de page si besoin.

### Calculateur de plateau

Les règles sont en haut de la fonction `initCalculator` dans `assets/js/main.js` :

- `RULES` : grammes de fromage par personne selon l’occasion (fourchette basse, haute) ;
- `CHEESES` et `RACLETTE` : fromages proposés, dans l’ordre (3, 5 ou 7 selon le nombre de convives).

### Photos

Les illustrations sont des dessins vectoriels originaux, intégrés directement dans la page. Pour les remplacer par vos photos, ajoutez vos images dans `assets/img/` puis remplacez le bloc `<svg>…</svg>` concerné par une balise `<img>` (par exemple dans les cartes fromages ou les recettes), en gardant le conteneur pour conserver les effets.

## Structure

```
index.html              page unique (contenu + illustrations SVG)
assets/css/style.css    styles, jetons de couleurs et de typographie
assets/js/main.js       animations et interactions
assets/vendor/          GSAP 3.15 (ScrollTrigger, SplitText) et Lenis 1.3
assets/fonts/           polices auto-hébergées (sans appel à Google)
assets/img/             favicon, icône iOS, image de partage, grain
```

## Crédits

- Animations : [GSAP](https://gsap.com) (licence « Standard No Charge », utilisation commerciale gratuite) et [Lenis](https://github.com/darkroomengineering/lenis) (MIT).
- Polices : Instrument Serif, Courier Prime et Work Sans, sous licence SIL Open Font License (fichiers `OFL-*.txt` dans `assets/fonts/`). Elles sont hébergées avec le site : aucune requête vers Google Fonts, ce qui simplifie la conformité RGPD.
