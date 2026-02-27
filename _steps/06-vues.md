---
title: "Les vues (CREATE VIEW)"
---

## Sauvegarder une requête complexe

Une **vue** est une requête sauvegardée sous un nom. Elle se comporte comme une table virtuelle : on peut l'interroger avec `SELECT`, mais elle ne stocke pas de données — elle exécute la requête à chaque fois.

### Pourquoi utiliser une vue ?

- **Simplifier** les requêtes complexes
- **Réutiliser** une requête fréquente
- **Clarifier** le code (un nom explicite plutôt qu'une requête compliquée)

### Créer une vue

```sql
CREATE VIEW depenses_par_categorie AS
SELECT
    categorie,
    COUNT(*) AS nb_depenses,
    SUM(montant) AS total,
    ROUND(AVG(montant), 2) AS moyenne
FROM depenses
GROUP BY categorie;
```

### Utiliser une vue

On interroge une vue exactement comme une table :

```sql
SELECT * FROM depenses_par_categorie;
```

| categorie | nb_depenses | total | moyenne |
|-----------|------------|-------|---------|
| Alimentation | 3 | 195.00 | 65.00 |
| Loisirs | 3 | 59.99 | 20.00 |
| Restaurant | 2 | 80.00 | 40.00 |
| Santé | 1 | 23.80 | 23.80 |
| Transport | 3 | 212.00 | 70.67 |

On peut ajouter `WHERE`, `ORDER BY`, etc. :

```sql
SELECT * FROM depenses_par_categorie
WHERE total > 100
ORDER BY total DESC;
```

### Exemples pratiques

Vue des recettes faciles :

```sql
CREATE VIEW recettes_faciles AS
SELECT nom, categorie, temps_preparation, note
FROM recettes
WHERE difficulte = 'Facile';
```

```sql
-- Maintenant on peut simplement écrire :
SELECT * FROM recettes_faciles ORDER BY note DESC;
```

Vue résumé mensuel des dépenses :

```sql
CREATE VIEW resume_mensuel AS
SELECT
    substr(date_depense, 1, 7) AS mois,
    COUNT(*) AS nb_depenses,
    SUM(montant) AS total,
    ROUND(AVG(montant), 2) AS moyenne
FROM depenses
GROUP BY substr(date_depense, 1, 7);
```

### Supprimer une vue

```sql
DROP VIEW depenses_par_categorie;

-- Ou en sécurité :
DROP VIEW IF EXISTS depenses_par_categorie;
```

### Vue sur vue

On peut créer une vue qui utilise une autre vue :

```sql
CREATE VIEW meilleures_recettes_faciles AS
SELECT * FROM recettes_faciles
WHERE note >= 4.5;
```

### Quand utiliser une vue ?

| Situation | Vue utile ? |
|-----------|------------|
| Requête utilisée souvent | Oui |
| Calcul complexe avec JOIN et agrégations | Oui |
| Requête ponctuelle | Non, une requête directe suffit |
| Besoin de stocker un résultat figé | Non, une vue est dynamique |

### Exercice

1. Crée une vue `recettes_rapides` qui affiche les recettes avec un temps de préparation inférieur à 30 minutes
2. Interroge cette vue pour afficher les recettes rapides triées par note décroissante
3. Crée une vue `budget_categories` qui affiche pour chaque catégorie de dépenses : le total, la moyenne et la dépense max
4. Utilise la vue `budget_categories` pour trouver les catégories où la moyenne dépasse 50€
5. Supprime la vue `recettes_rapides`

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Vue recettes rapides
CREATE VIEW recettes_rapides AS
SELECT nom, categorie, temps_preparation, note
FROM recettes
WHERE temps_preparation < 30;

-- 2. Recettes rapides par note
SELECT * FROM recettes_rapides
ORDER BY note DESC;

-- 3. Vue budget par catégorie
CREATE VIEW budget_categories AS
SELECT
    categorie,
    ROUND(SUM(montant), 2) AS total,
    ROUND(AVG(montant), 2) AS moyenne,
    MAX(montant) AS depense_max
FROM depenses
GROUP BY categorie;

-- 4. Catégories avec moyenne > 50€
SELECT * FROM budget_categories
WHERE moyenne > 50;

-- 5. Suppression
DROP VIEW recettes_rapides;
```

</details>
