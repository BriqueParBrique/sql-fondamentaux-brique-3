---
title: "CREATE TABLE"
---

## Créer ses propres tables

Jusqu'ici, on a lu et interrogé des données existantes. Maintenant, on va apprendre à **créer nos propres tables** à partir de zéro.

### La syntaxe de base

```sql
CREATE TABLE nom_de_la_table (
    nom_colonne TYPE,
    nom_colonne TYPE,
    ...
);
```

### Les types de données en SQLite

| Type | Description | Exemple |
|------|-------------|---------|
| `INTEGER` | Nombre entier | 42, -7, 2024 |
| `REAL` | Nombre décimal | 3.14, 9.99 |
| `TEXT` | Texte | 'Bonjour', 'SQL' |

### La clé primaire (PRIMARY KEY)

Chaque table a besoin d'un **identifiant unique** pour chaque ligne. C'est la **clé primaire** :

```sql
CREATE TABLE recettes (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    categorie TEXT,
    temps_preparation INTEGER,
    difficulte TEXT,
    note REAL
);
```

- `id INTEGER PRIMARY KEY` : chaque recette a un numéro unique
- `temps_preparation` : en minutes
- `note` : sur 5

### Exemple concret : une table de recettes

```sql
CREATE TABLE recettes (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    categorie TEXT,
    temps_preparation INTEGER,
    difficulte TEXT,
    note REAL
);
```

Vérifions que la table a été créée :

```sql
-- En SQLite, on peut lister les tables
SELECT name FROM sqlite_master WHERE type = 'table';
```

### Créer une deuxième table

```sql
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    unite TEXT
);
```

### Supprimer une table

Si tu as fait une erreur, tu peux supprimer une table :

```sql
DROP TABLE recettes;
```

Pour éviter une erreur si la table n'existe pas :

```sql
DROP TABLE IF EXISTS recettes;
```

### Bonnes pratiques

- Les noms de tables et colonnes en **minuscules**, avec des **underscores** (snake_case)
- Toujours une **clé primaire** (`id INTEGER PRIMARY KEY`)
- Choisir le **type le plus adapté** (INTEGER pour les nombres entiers, REAL pour les décimaux, TEXT pour le reste)
- Des noms de colonnes **descriptifs** (`temps_preparation` plutôt que `tp`)

### Exercice

1. Crée une table `films` avec les colonnes : id (clé primaire), titre (texte), realisateur (texte), annee (entier), note (décimal)
2. Crée une table `jeux_video` avec les colonnes : id (clé primaire), titre (texte), plateforme (texte), genre (texte), annee_sortie (entier), prix (décimal)
3. Vérifie que tes tables existent avec `SELECT name FROM sqlite_master WHERE type = 'table';`
4. Supprime la table `jeux_video`, puis vérifie qu'elle n'existe plus

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Table films
CREATE TABLE films (
    id INTEGER PRIMARY KEY,
    titre TEXT,
    realisateur TEXT,
    annee INTEGER,
    note REAL
);

-- 2. Table jeux_video
CREATE TABLE jeux_video (
    id INTEGER PRIMARY KEY,
    titre TEXT,
    plateforme TEXT,
    genre TEXT,
    annee_sortie INTEGER,
    prix REAL
);

-- 3. Vérification
SELECT name FROM sqlite_master WHERE type = 'table';

-- 4. Suppression
DROP TABLE jeux_video;
SELECT name FROM sqlite_master WHERE type = 'table';
```

</details>
