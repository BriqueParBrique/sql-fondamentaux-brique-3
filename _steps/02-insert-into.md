---
title: "INSERT INTO"
---

## Ajouter des données

Une table vide n'est pas très utile ! `INSERT INTO` permet d'ajouter des lignes.

### Préparer notre table

Si ce n'est pas déjà fait, crée la table de recettes :

```sql
DROP TABLE IF EXISTS recettes;

CREATE TABLE recettes (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    categorie TEXT,
    temps_preparation INTEGER,
    difficulte TEXT,
    note REAL
);
```

### Insérer une ligne

```sql
INSERT INTO recettes (id, nom, categorie, temps_preparation, difficulte, note)
VALUES (1, 'Crêpes', 'Dessert', 30, 'Facile', 4.5);
```

Vérifie :

```sql
SELECT * FROM recettes;
```

### Insérer sans préciser les colonnes

Si tu insères des valeurs pour **toutes** les colonnes, dans l'ordre de création, tu peux omettre la liste des colonnes :

```sql
INSERT INTO recettes VALUES (2, 'Ratatouille', 'Plat', 45, 'Moyen', 4.2);
```

La forme avec les noms de colonnes est **recommandée** car elle est plus claire et résiste aux changements de structure.

### Insérer plusieurs lignes en une fois

```sql
INSERT INTO recettes (id, nom, categorie, temps_preparation, difficulte, note) VALUES
(3, 'Salade César', 'Entrée', 15, 'Facile', 3.8),
(4, 'Bœuf Bourguignon', 'Plat', 180, 'Difficile', 4.8),
(5, 'Tarte aux pommes', 'Dessert', 60, 'Moyen', 4.3),
(6, 'Soupe à l''oignon', 'Entrée', 40, 'Facile', 4.0),
(7, 'Quiche Lorraine', 'Plat', 50, 'Moyen', 4.1),
(8, 'Mousse au chocolat', 'Dessert', 20, 'Facile', 4.7),
(9, 'Coq au vin', 'Plat', 120, 'Difficile', 4.6),
(10, 'Crème brûlée', 'Dessert', 45, 'Moyen', 4.9);
```

### L'apostrophe dans les textes

Pour insérer un texte qui contient une apostrophe, on la double :

```sql
-- 'Soupe à l''oignon' → insère "Soupe à l'oignon"
INSERT INTO recettes (id, nom, categorie, temps_preparation, difficulte, note)
VALUES (11, 'Gratin d''aubergines', 'Plat', 55, 'Moyen', 4.0);
```

### Auto-incrémentation de l'id

Avec SQLite, si la colonne est `INTEGER PRIMARY KEY`, elle peut s'auto-incrémenter :

```sql
-- On peut omettre l'id, SQLite le génère automatiquement
INSERT INTO recettes (nom, categorie, temps_preparation, difficulte, note)
VALUES ('Tiramisu', 'Dessert', 30, 'Moyen', 4.8);
```

### Exercice

1. Crée une table `livres` (id, titre, auteur, annee, genre, pages) et insère 3 livres
2. Insère 5 recettes supplémentaires dans la table `recettes` en une seule requête
3. Insère une recette dont le nom contient une apostrophe
4. Insère une recette sans préciser l'id (auto-incrémentation)
5. Vérifie toutes tes insertions avec `SELECT * FROM recettes;`

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Table livres avec insertions
CREATE TABLE livres (
    id INTEGER PRIMARY KEY,
    titre TEXT,
    auteur TEXT,
    annee INTEGER,
    genre TEXT,
    pages INTEGER
);

INSERT INTO livres (id, titre, auteur, annee, genre, pages) VALUES
(1, 'Le Petit Prince', 'Saint-Exupéry', 1943, 'Conte', 96),
(2, 'L''Étranger', 'Camus', 1942, 'Roman', 186),
(3, '1984', 'Orwell', 1949, 'Science-fiction', 328);

-- 2. Cinq recettes en une requête
INSERT INTO recettes (nom, categorie, temps_preparation, difficulte, note) VALUES
('Pâtes carbonara', 'Plat', 25, 'Facile', 4.2),
('Fondant au chocolat', 'Dessert', 35, 'Moyen', 4.6),
('Taboulé', 'Entrée', 20, 'Facile', 3.9),
('Risotto aux champignons', 'Plat', 40, 'Moyen', 4.4),
('Salade niçoise', 'Entrée', 15, 'Facile', 4.0);

-- 3. Nom avec apostrophe
INSERT INTO recettes (nom, categorie, temps_preparation, difficulte, note)
VALUES ('Tarte à l''abricot', 'Dessert', 50, 'Moyen', 4.1);

-- 4. Sans id
INSERT INTO recettes (nom, categorie, temps_preparation, difficulte, note)
VALUES ('Gazpacho', 'Entrée', 15, 'Facile', 4.0);

-- 5. Vérification
SELECT * FROM recettes;
```

</details>
