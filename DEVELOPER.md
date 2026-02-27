<!-- Managed by BriqueParBrique/nouvelle-brique — do not edit in brick repos -->

# Développement

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Just](https://github.com/casey/just)

## Démarrage rapide

```sh
just serve
```

Cela construit l'image Docker (Ruby 3.3 + Jekyll 4) puis lance le serveur local avec livereload.

Le site est accessible sur [http://localhost:4000/nouvelle-brique/](http://localhost:4000/nouvelle-brique/).

## Commandes disponibles

| Commande     | Description                           |
| ------------ | ------------------------------------- |
| `just serve` | Lance Jekyll en local avec livereload |
| `just build` | Génère le site dans `_site/`          |
| `just clean` | Supprime les fichiers générés         |

## Structure du projet

```text
.
├── _config.yml          # Configuration Jekyll
├── _data/
│   └── steps.yml        # Liste des étapes (données)
├── _layouts/
│   ├── default.html     # Layout principal
│   └── step.html        # Layout d'une étape
├── _steps/              # Contenu des étapes (Markdown)
├── assets/
│   ├── css/style.css    # Styles
│   └── img/             # Images et logo
├── index.html           # Page d'accueil (template Liquid)
├── Dockerfile           # Image Docker pour le dev local
├── Gemfile              # Dépendances Ruby
└── justfile             # Commandes de développement
```

## Ajouter ou modifier une étape

Les étapes sont définies dans `_data/steps.yml`. Chaque entrée possède les champs suivants :

```yaml
- title: "Introduction"   # Titre affiché
  file: "01-introduction"  # Nom du fichier dans _steps/ (sans extension)
```

Le contenu de chaque étape est un fichier Markdown dans `_steps/` avec un front matter minimal :

```yaml
---
title: "Introduction"
---
```

## Hébergement

Le site est déployé automatiquement via GitHub Actions depuis la branche `main`.
