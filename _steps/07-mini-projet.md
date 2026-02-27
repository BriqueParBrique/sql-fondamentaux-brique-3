---
title: "Mini-projet final"
---

## Mini-projet : Gestionnaire de dépenses personnelles

C'est le dernier mini-projet des trois niveaux SQL Fondamentaux ! Tu vas concevoir une base de données complète **de zéro** et l'exploiter avec tout ce que tu as appris.

### Le contexte

Tu veux suivre tes dépenses personnelles. Tu dois concevoir la base, créer les tables, insérer des données, puis écrire des requêtes d'analyse.

### Étape 1 — Créer les tables

Crée ces trois tables avec les contraintes appropriées :

**Défi 1** : Crée une table `categories` (id, nom UNIQUE NOT NULL, budget_mensuel REAL DEFAULT 0).

**Défi 2** : Crée une table `depenses` (id, description NOT NULL, montant NOT NULL, categorie_id FOREIGN KEY vers categories, date_depense NOT NULL).

**Défi 3** : Crée une table `budgets` (id, categorie_id FOREIGN KEY vers categories, mois TEXT NOT NULL, montant_prevu REAL NOT NULL).

### Étape 2 — Remplir les tables

**Défi 4** : Insère au moins 5 catégories (Alimentation, Transport, Loisirs, Santé, Restaurant) et 15 dépenses réparties sur 2 mois. Insère aussi des budgets mensuels pour chaque catégorie.

<details>
<summary>Voir un exemple d'insertions</summary>

```sql
PRAGMA foreign_keys = ON;

INSERT INTO categories (id, nom, budget_mensuel) VALUES
(1, 'Alimentation', 300),
(2, 'Transport', 150),
(3, 'Loisirs', 100),
(4, 'Santé', 80),
(5, 'Restaurant', 120);

INSERT INTO depenses (id, description, montant, categorie_id, date_depense) VALUES
(1, 'Courses Carrefour', 87.50, 1, '2024-01-05'),
(2, 'Essence', 65.00, 2, '2024-01-08'),
(3, 'Restaurant italien', 42.00, 5, '2024-01-12'),
(4, 'Netflix', 13.49, 3, '2024-01-15'),
(5, 'Courses Leclerc', 62.30, 1, '2024-01-19'),
(6, 'Train Paris-Lyon', 89.00, 2, '2024-01-22'),
(7, 'Cinéma', 11.50, 3, '2024-01-25'),
(8, 'Pharmacie', 23.80, 4, '2024-01-28'),
(9, 'Courses Monoprix', 45.20, 1, '2024-02-05'),
(10, 'Salle de sport', 35.00, 3, '2024-02-08'),
(11, 'Restaurant japonais', 38.00, 5, '2024-02-10'),
(12, 'Essence', 58.00, 2, '2024-02-12'),
(13, 'Courses bio', 53.40, 1, '2024-02-15'),
(14, 'Médecin', 25.00, 4, '2024-02-18'),
(15, 'Pizzeria', 28.50, 5, '2024-02-22');

INSERT INTO budgets (id, categorie_id, mois, montant_prevu) VALUES
(1, 1, '2024-01', 300),
(2, 2, '2024-01', 150),
(3, 3, '2024-01', 100),
(4, 4, '2024-01', 80),
(5, 5, '2024-01', 120),
(6, 1, '2024-02', 300),
(7, 2, '2024-02', 150),
(8, 3, '2024-02', 100),
(9, 4, '2024-02', 80),
(10, 5, '2024-02', 120);
```

</details>

### Étape 3 — Modifier les données

**Défi 5** : Le prix de Netflix a augmenté. Mets à jour la dépense "Netflix" à 15.49€. Supprime la dépense "Salle de sport" (tu as résilié l'abonnement).

### Étape 4 — Analyser avec des sous-requêtes et des vues

**Défi 6** : Écris une sous-requête pour trouver les dépenses dont le montant est supérieur à la moyenne de leur catégorie.

**Défi 7** : Crée une vue `tableau_de_bord` qui affiche pour chaque catégorie : le nom, le nombre de dépenses, le total dépensé et le budget mensuel. Puis utilise cette vue pour trouver les catégories où le total dépensé dépasse le budget.

### Solutions

<details>
<summary>Voir toutes les solutions</summary>

```sql
-- Défi 1 : Table categories
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL,
    budget_mensuel REAL DEFAULT 0
);

-- Défi 2 : Table depenses
CREATE TABLE depenses (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    montant REAL NOT NULL,
    categorie_id INTEGER NOT NULL,
    date_depense TEXT NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- Défi 3 : Table budgets
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    categorie_id INTEGER NOT NULL,
    mois TEXT NOT NULL,
    montant_prevu REAL NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- Défi 5 : Modifications
UPDATE depenses SET montant = 15.49 WHERE description = 'Netflix';
DELETE FROM depenses WHERE description = 'Salle de sport';

-- Défi 6 : Sous-requête
SELECT d.description, d.montant, c.nom AS categorie
FROM depenses AS d
INNER JOIN categories AS c ON d.categorie_id = c.id
WHERE d.montant > (
    SELECT AVG(d2.montant)
    FROM depenses AS d2
    WHERE d2.categorie_id = d.categorie_id
);

-- Défi 7 : Vue tableau de bord
CREATE VIEW tableau_de_bord AS
SELECT
    c.nom AS categorie,
    COUNT(d.id) AS nb_depenses,
    ROUND(SUM(d.montant), 2) AS total_depense,
    c.budget_mensuel
FROM categories AS c
LEFT JOIN depenses AS d ON c.id = d.categorie_id
GROUP BY c.id, c.nom, c.budget_mensuel;

-- Catégories en dépassement
SELECT * FROM tableau_de_bord
WHERE total_depense > budget_mensuel;
```

</details>

### Félicitations !

Tu as terminé les **3 niveaux de SQL Fondamentaux** ! Voici un résumé de tout ce que tu as appris :

**Niveau 1 — Lire les données :**
- `SELECT` / `FROM` pour interroger une table
- `WHERE` pour filtrer
- `ORDER BY` et `LIMIT` pour trier et limiter

**Niveau 2 — Transformer et combiner :**
- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` pour agréger
- `GROUP BY` et `HAVING` pour regrouper
- `INNER JOIN` et `LEFT JOIN` pour croiser les tables
- Les alias `AS` pour la lisibilité

**Niveau 3 — Écrire et structurer :**
- `CREATE TABLE` pour concevoir ses tables
- `INSERT INTO` pour ajouter des données
- `UPDATE` et `DELETE` pour modifier et supprimer
- Les contraintes (`NOT NULL`, `UNIQUE`, `DEFAULT`, `FOREIGN KEY`)
- Les sous-requêtes pour imbriquer des questions
- Les vues pour sauvegarder des requêtes complexes

Tu as maintenant les bases solides pour travailler avec n'importe quelle base de données SQL. Bravo !
