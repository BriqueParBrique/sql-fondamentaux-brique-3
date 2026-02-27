---
title: "Les sous-requêtes"
---

## Imbriquer des requêtes

Une **sous-requête** est un `SELECT` placé à l'intérieur d'un autre `SELECT`. C'est comme poser une question dont la réponse sert à poser une autre question.

### Préparer les données

Ajoutons une table de dépenses pour varier les exemples :

```sql
CREATE TABLE depenses (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    montant REAL NOT NULL,
    categorie TEXT NOT NULL,
    date_depense TEXT NOT NULL
);

INSERT INTO depenses VALUES
(1, 'Courses Carrefour', 87.50, 'Alimentation', '2024-01-05'),
(2, 'Essence', 65.00, 'Transport', '2024-01-08'),
(3, 'Restaurant italien', 42.00, 'Restaurant', '2024-01-12'),
(4, 'Abonnement Netflix', 13.49, 'Loisirs', '2024-01-15'),
(5, 'Courses Leclerc', 62.30, 'Alimentation', '2024-01-19'),
(6, 'Train Paris-Lyon', 89.00, 'Transport', '2024-01-22'),
(7, 'Cinéma', 11.50, 'Loisirs', '2024-01-25'),
(8, 'Pharmacie', 23.80, 'Santé', '2024-01-28'),
(9, 'Restaurant japonais', 38.00, 'Restaurant', '2024-02-02'),
(10, 'Courses Monoprix', 45.20, 'Alimentation', '2024-02-05'),
(11, 'Abonnement salle de sport', 35.00, 'Loisirs', '2024-02-08'),
(12, 'Essence', 58.00, 'Transport', '2024-02-12');
```

### Sous-requête dans WHERE

Trouver les dépenses supérieures à la moyenne :

```sql
SELECT description, montant
FROM depenses
WHERE montant > (SELECT AVG(montant) FROM depenses);
```

Comment ça marche :
1. La sous-requête `(SELECT AVG(montant) FROM depenses)` calcule la moyenne (~47.57)
2. La requête principale garde les dépenses au-dessus de ce montant

### Sous-requête avec IN

Trouver les recettes dans les catégories qui ont plus de 3 recettes :

```sql
SELECT nom, categorie FROM recettes
WHERE categorie IN (
    SELECT categorie FROM recettes
    GROUP BY categorie
    HAVING COUNT(*) > 3
);
```

### Sous-requête qui retourne une seule valeur

```sql
-- La dépense la plus chère
SELECT description, montant
FROM depenses
WHERE montant = (SELECT MAX(montant) FROM depenses);
```

### Sous-requête dans FROM

On peut aussi utiliser une sous-requête comme "table temporaire" :

```sql
-- Moyenne des dépenses par catégorie, puis filtrer
SELECT categorie, total
FROM (
    SELECT categorie, SUM(montant) AS total
    FROM depenses
    GROUP BY categorie
) AS sous_totaux
WHERE total > 100;
```

### Comparer avec la moyenne du groupe

Trouver les dépenses qui sont au-dessus de la moyenne de leur catégorie :

```sql
SELECT d.description, d.montant, d.categorie
FROM depenses AS d
WHERE d.montant > (
    SELECT AVG(d2.montant)
    FROM depenses AS d2
    WHERE d2.categorie = d.categorie
);
```

C'est une **sous-requête corrélée** : elle utilise une valeur de la requête principale (`d.categorie`).

### Exercice

1. Affiche les dépenses dont le montant est supérieur à la moyenne
2. Affiche la dépense la moins chère (en utilisant une sous-requête)
3. Affiche les catégories de dépenses dont le total dépasse 100€
4. Affiche les recettes dont la note est supérieure à la note moyenne (utilise la table `recettes` de l'étape 2)
5. Affiche les dépenses de la catégorie qui a le plus grand nombre de dépenses

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Dépenses au-dessus de la moyenne
SELECT description, montant
FROM depenses
WHERE montant > (SELECT AVG(montant) FROM depenses);

-- 2. Dépense la moins chère
SELECT description, montant
FROM depenses
WHERE montant = (SELECT MIN(montant) FROM depenses);

-- 3. Catégories avec total > 100€
SELECT categorie, SUM(montant) AS total
FROM depenses
GROUP BY categorie
HAVING SUM(montant) > 100;

-- 4. Recettes au-dessus de la moyenne
SELECT nom, note
FROM recettes
WHERE note > (SELECT AVG(note) FROM recettes);

-- 5. Dépenses de la catégorie la plus fréquente
SELECT description, montant, categorie
FROM depenses
WHERE categorie = (
    SELECT categorie FROM depenses
    GROUP BY categorie
    ORDER BY COUNT(*) DESC
    LIMIT 1
);
```

</details>
