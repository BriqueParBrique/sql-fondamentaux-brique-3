---
title: "Les contraintes"
---

## Protéger ses données

Les contraintes permettent de définir des **règles** sur les colonnes. Elles empêchent l'insertion de données invalides.

### NOT NULL — Interdire les valeurs vides

```sql
CREATE TABLE recettes_v2 (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    categorie TEXT NOT NULL,
    temps_preparation INTEGER,
    difficulte TEXT,
    note REAL
);
```

Maintenant, essayer d'insérer sans nom provoque une erreur :

```sql
-- ❌ Erreur ! nom ne peut pas être NULL
INSERT INTO recettes_v2 (id, categorie) VALUES (1, 'Dessert');

-- ✓ Correct
INSERT INTO recettes_v2 (id, nom, categorie) VALUES (1, 'Crêpes', 'Dessert');
```

### UNIQUE — Interdire les doublons

```sql
CREATE TABLE utilisateurs (
    id INTEGER PRIMARY KEY,
    pseudo TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL
);
```

```sql
INSERT INTO utilisateurs VALUES (1, 'alice42', 'alice@mail.com', 'Alice Martin');

-- ❌ Erreur ! Le pseudo "alice42" existe déjà
INSERT INTO utilisateurs VALUES (2, 'alice42', 'bob@mail.com', 'Bob Dupont');
```

### DEFAULT — Valeur par défaut

```sql
CREATE TABLE commandes (
    id INTEGER PRIMARY KEY,
    produit TEXT NOT NULL,
    quantite INTEGER DEFAULT 1,
    statut TEXT DEFAULT 'en attente'
);
```

```sql
-- La quantité sera 1 et le statut "en attente" automatiquement
INSERT INTO commandes (id, produit) VALUES (1, 'Livre SQL');

SELECT * FROM commandes;
```

| id | produit | quantite | statut |
|----|---------|----------|--------|
| 1 | Livre SQL | 1 | en attente |

### FOREIGN KEY — Relier les tables

Une **clé étrangère** crée un lien entre deux tables et garantit que la référence est valide.

```sql
DROP TABLE IF EXISTS ingredients_recette;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recettes_v3;

CREATE TABLE recettes_v3 (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    categorie TEXT NOT NULL
);

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    recette_id INTEGER NOT NULL,
    nom TEXT NOT NULL,
    quantite TEXT,
    FOREIGN KEY (recette_id) REFERENCES recettes_v3(id)
);
```

Pour que SQLite vérifie les clés étrangères, il faut activer cette option :

```sql
PRAGMA foreign_keys = ON;
```

Maintenant :

```sql
INSERT INTO recettes_v3 VALUES (1, 'Crêpes', 'Dessert');

-- ✓ Correct : la recette 1 existe
INSERT INTO ingredients VALUES (1, 1, 'Farine', '250g');

-- ❌ Erreur ! La recette 99 n'existe pas
INSERT INTO ingredients VALUES (2, 99, 'Sucre', '50g');
```

### Combiner les contraintes

On peut mettre plusieurs contraintes sur une même colonne :

```sql
CREATE TABLE produits (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    prix REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0
);
```

### Exercice

1. Crée une table `eleves` avec : id (clé primaire), nom (NOT NULL), prenom (NOT NULL), email (UNIQUE, NOT NULL), age (INTEGER)
2. Insère 3 élèves, puis essaie d'insérer un élève avec le même email — que se passe-t-il ?
3. Crée une table `notes` avec : id, eleve_id (FOREIGN KEY vers eleves), matiere (NOT NULL), note (REAL, NOT NULL), commentaire (DEFAULT 'Aucun commentaire')
4. Active `PRAGMA foreign_keys = ON`, puis essaie d'insérer une note pour un élève qui n'existe pas
5. Insère 2 notes valides et vérifie avec `SELECT * FROM notes;`

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Table élèves
CREATE TABLE eleves (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER
);

-- 2. Insertions
INSERT INTO eleves VALUES (1, 'Martin', 'Alice', 'alice@ecole.fr', 15);
INSERT INTO eleves VALUES (2, 'Dupont', 'Bob', 'bob@ecole.fr', 16);
INSERT INTO eleves VALUES (3, 'Petit', 'Claire', 'claire@ecole.fr', 15);

-- ❌ Erreur ! Email déjà utilisé
-- INSERT INTO eleves VALUES (4, 'Moreau', 'David', 'alice@ecole.fr', 17);

-- 3. Table notes
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    eleve_id INTEGER NOT NULL,
    matiere TEXT NOT NULL,
    note REAL NOT NULL,
    commentaire TEXT DEFAULT 'Aucun commentaire',
    FOREIGN KEY (eleve_id) REFERENCES eleves(id)
);

-- 4. Clés étrangères
PRAGMA foreign_keys = ON;

-- ❌ Erreur ! L'élève 99 n'existe pas
-- INSERT INTO notes VALUES (1, 99, 'Maths', 15.5, 'Bien');

-- 5. Notes valides
INSERT INTO notes (id, eleve_id, matiere, note) VALUES (1, 1, 'Maths', 17.5);
INSERT INTO notes (id, eleve_id, matiere, note, commentaire) VALUES (2, 2, 'Français', 14.0, 'En progrès');

SELECT * FROM notes;
```

</details>
