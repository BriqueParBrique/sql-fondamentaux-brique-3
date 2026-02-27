---
title: "UPDATE et DELETE"
---

## Modifier et supprimer des données

### UPDATE — Modifier des lignes

`UPDATE` permet de changer les valeurs d'une ou plusieurs colonnes dans des lignes existantes.

```sql
-- Modifier la note de la recette "Crêpes"
UPDATE recettes
SET note = 4.7
WHERE nom = 'Crêpes';
```

On peut modifier plusieurs colonnes en même temps :

```sql
UPDATE recettes
SET difficulte = 'Facile', temps_preparation = 25
WHERE nom = 'Crêpes';
```

### LA RÈGLE LA PLUS IMPORTANTE

> **Ne jamais oublier le WHERE avec UPDATE ou DELETE !**

Sans `WHERE`, **toutes les lignes** sont modifiées :

```sql
-- ⚠️ DANGER : change la note de TOUTES les recettes !
UPDATE recettes SET note = 0;

-- ✓ CORRECT : change uniquement la recette avec id = 1
UPDATE recettes SET note = 4.7 WHERE id = 1;
```

**Astuce de sécurité** : avant un UPDATE, teste ton WHERE avec un SELECT :

```sql
-- D'abord, vérifier quelles lignes seront touchées
SELECT * FROM recettes WHERE id = 1;

-- Ensuite seulement, modifier
UPDATE recettes SET note = 4.7 WHERE id = 1;
```

### DELETE — Supprimer des lignes

```sql
-- Supprimer la recette avec l'id 11
DELETE FROM recettes WHERE id = 11;
```

Même règle que pour UPDATE :

```sql
-- ⚠️ DANGER : supprime TOUTES les recettes !
DELETE FROM recettes;

-- ✓ CORRECT : supprime uniquement l'id 11
DELETE FROM recettes WHERE id = 11;
```

### UPDATE avec des calculs

On peut utiliser la valeur actuelle dans le calcul :

```sql
-- Augmenter le temps de préparation de 10 minutes pour les recettes "Difficile"
UPDATE recettes
SET temps_preparation = temps_preparation + 10
WHERE difficulte = 'Difficile';
```

### DELETE avec des conditions complexes

```sql
-- Supprimer les entrées avec une note inférieure à 4
DELETE FROM recettes
WHERE categorie = 'Entrée' AND note < 4;
```

### Vérification avant/après

La bonne pratique :

```sql
-- 1. Voir l'état actuel
SELECT * FROM recettes WHERE id = 5;

-- 2. Modifier
UPDATE recettes SET note = 4.5 WHERE id = 5;

-- 3. Vérifier le résultat
SELECT * FROM recettes WHERE id = 5;
```

### Exercice

Assure-toi d'avoir la table `recettes` avec des données (voir étape précédente).

1. Modifie la note de "Mousse au chocolat" à 5.0
2. Change la catégorie de "Quiche Lorraine" de "Plat" à "Entrée"
3. Augmente le temps de préparation de 5 minutes pour toutes les recettes de catégorie "Dessert"
4. Supprime toutes les recettes avec une note inférieure à 4.0
5. Vérifie le résultat avec `SELECT * FROM recettes ORDER BY note DESC;`

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Modifier la note de Mousse au chocolat
UPDATE recettes SET note = 5.0 WHERE nom = 'Mousse au chocolat';

-- 2. Changer la catégorie de Quiche Lorraine
UPDATE recettes SET categorie = 'Entrée' WHERE nom = 'Quiche Lorraine';

-- 3. +5 min pour les desserts
UPDATE recettes
SET temps_preparation = temps_preparation + 5
WHERE categorie = 'Dessert';

-- 4. Supprimer les recettes mal notées
DELETE FROM recettes WHERE note < 4.0;

-- 5. Vérification
SELECT * FROM recettes ORDER BY note DESC;
```

</details>
