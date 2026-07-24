---
title: "Les vues (CREATE VIEW)"
---

## Sauvegarder une requête complexe

Une **vue** est une requête sauvegardée sous un nom. Elle se comporte comme une
table virtuelle : on l'interroge avec `SELECT`, mais elle ne stocke aucune
donnée — elle réexécute sa requête à chaque appel.

> **Jeu de données** : cette étape utilise les tables `categories` et `depenses`
> dans leur version définitive. Au besoin, relance le bloc de référence de
> **l'étape 4**.

### Pourquoi utiliser une vue ?

- **Simplifier** : une requête compliquée devient un nom lisible
- **Réutiliser** : on l'écrit une fois, on s'en sert partout
- **Fiabiliser** : la logique est écrite à un seul endroit, donc on ne risque pas de la recopier de travers

### Créer une vue

Reprenons le total par catégorie — une requête qu'on écrit sans arrêt :

```sql
CREATE VIEW depenses_par_categorie AS
SELECT
    c.nom AS categorie,
    COUNT(d.id) AS nb_depenses,
    ROUND(SUM(d.montant), 2) AS total,
    ROUND(AVG(d.montant), 2) AS moyenne
FROM categories AS c
LEFT JOIN depenses AS d ON c.id = d.categorie_id
GROUP BY c.id, c.nom;
```

Note le `LEFT JOIN` : si une catégorie n'a aucune dépense, on veut quand même la
voir apparaître avec 0. C'est le réflexe du niveau 2.

### Utiliser une vue

On l'interroge exactement comme une table :

```sql
SELECT * FROM depenses_par_categorie;
```

| categorie    | nb_depenses | total  | moyenne |
| ------------ | ----------- | ------ | ------- |
| Alimentation | 5           | 308.4  | 61.68   |
| Loisirs      | 5           | 135.48 | 27.1    |
| Restaurant   | 3           | 108.5  | 36.17   |
| Santé        | 2           | 48.8   | 24.4    |
| Transport    | 3           | 212.0  | 70.67   |

*(Comme toujours sans `ORDER BY`, l'ordre des lignes n'est pas garanti.)*

Et comme toute table, elle accepte `WHERE`, `ORDER BY`, `LIMIT` :

```sql
SELECT * FROM depenses_par_categorie
WHERE total > 150
ORDER BY total DESC;
```

C'est là que les vues deviennent agréables : ce `WHERE total > 150` remplace le
`HAVING SUM(d.montant) > 150` de la requête d'origine. On filtre sur un nom de
colonne simple au lieu de répéter le calcul.

### Une vue est toujours à jour

Une vue n'est pas une photo, c'est une question. Ajoutons une dépense :

```sql
INSERT INTO depenses (id, description, montant, categorie_id, date_depense)
VALUES (99, 'Courses du dimanche', 40.00, 1, '2024-02-28');

-- Le total d'Alimentation est passé de 308.4 à 348.4, sans rien recalculer
SELECT * FROM depenses_par_categorie WHERE categorie = 'Alimentation';

DELETE FROM depenses WHERE id = 99;   -- on nettoie
```

C'est l'avantage et la limite : toujours juste, mais recalculé à chaque appel. Sur
de très grosses tables, une vue coûteuse reste coûteuse.

### Regrouper par mois grâce au format de date

Souviens-toi de l'étape 1 : on stocke les dates au format `'AAAA-MM-JJ'`. Les sept
premiers caractères d'une date sont donc exactement son mois : `'2024-01-15'` →
`'2024-01'`.

La fonction `substr(texte, position, longueur)` extrait un morceau de texte :

```sql
SELECT date_depense, substr(date_depense, 1, 7) AS mois
FROM depenses LIMIT 3;
```

| date_depense | mois    |
| ------------ | ------- |
| 2024-01-05   | 2024-01 |
| 2024-01-08   | 2024-01 |
| 2024-01-12   | 2024-01 |

C'est tout ce qu'il faut pour un résumé mensuel :

```sql
CREATE VIEW resume_mensuel AS
SELECT
    substr(date_depense, 1, 7) AS mois,
    COUNT(*) AS nb_depenses,
    ROUND(SUM(montant), 2) AS total,
    ROUND(AVG(montant), 2) AS moyenne
FROM depenses
GROUP BY substr(date_depense, 1, 7);
```

```sql
SELECT * FROM resume_mensuel ORDER BY mois;
```

| mois    | nb_depenses | total  | moyenne |
| ------- | ----------- | ------ | ------- |
| 2024-01 | 8           | 394.59 | 49.32   |
| 2024-02 | 10          | 418.59 | 41.86   |

Tu vois pourquoi le format `AAAA-MM-JJ` n'était pas un détail : avec
`'15/01/2024'`, `substr(…, 1, 7)` aurait donné `'15/01/2'`, ce qui ne veut rien
dire.

### Vue sur vue

Une vue peut s'appuyer sur une autre vue, ce qui permit d'empiler les couches :

```sql
CREATE VIEW gros_postes AS
SELECT * FROM depenses_par_categorie
WHERE total > 150;
```

```sql
SELECT categorie, total FROM gros_postes ORDER BY total DESC;
```

### Supprimer une vue

```sql
DROP VIEW gros_postes;

-- Ou, pour un script rejouable :
DROP VIEW IF EXISTS gros_postes;
```

> **Attention à l'ordre** : `gros_postes` dépend de `depenses_par_categorie`. Si tu
> supprimes la vue du dessous, SQLite ne dit rien sur le moment — mais toute
> interrogation de `gros_postes` échouera ensuite avec « no such table ». Supprime
> toujours les vues qui dépendent des autres en premier.

### Quand utiliser une vue ?

| Situation                                  | Vue utile ? |
| ------------------------------------------ | ----------- |
| Requête utilisée souvent                   | Oui         |
| Calcul complexe avec JOIN et agrégations   | Oui         |
| Logique qu'on ne veut écrire qu'une fois   | Oui         |
| Requête ponctuelle                         | Non, une requête directe suffit |
| Besoin de figer un résultat dans le temps  | Non, une vue est toujours recalculée |

### Exercice

Le nombre de lignes attendu est indiqué entre parenthèses.

1. Crée une vue `depenses_detaillees` qui affiche, pour chaque dépense, sa
   description, son montant, sa date et le **nom** de sa catégorie *(18 lignes)*
2. Utilise cette vue pour afficher les dépenses de la catégorie « Loisirs », triées
   par montant décroissant *(5 lignes)*
3. Crée une vue `budget_categories` qui affiche pour chaque catégorie : son nom, le
   total dépensé, la moyenne et la dépense maximale *(5 lignes)*
4. Utilise `budget_categories` pour trouver les catégories dont la moyenne dépasse
   50 € *(2 lignes)*
5. Crée une vue `depenses_par_moyen_paiement` qui totalise les dépenses par moyen de
   paiement *(3 lignes)*
6. Supprime la vue `depenses_par_moyen_paiement`

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Vue détaillée avec le nom de la catégorie
DROP VIEW IF EXISTS depenses_detaillees;

CREATE VIEW depenses_detaillees AS
SELECT
    d.description,
    d.montant,
    d.date_depense,
    c.nom AS categorie
FROM depenses AS d
INNER JOIN categories AS c ON d.categorie_id = c.id;

-- 2. Les loisirs, du plus cher au moins cher.
--    Toute la jointure est déjà faite : on écrit juste un WHERE.
SELECT * FROM depenses_detaillees
WHERE categorie = 'Loisirs'
ORDER BY montant DESC;

-- 3. Vue budget par catégorie
DROP VIEW IF EXISTS budget_categories;

CREATE VIEW budget_categories AS
SELECT
    c.nom AS categorie,
    ROUND(SUM(d.montant), 2) AS total,
    ROUND(AVG(d.montant), 2) AS moyenne,
    MAX(d.montant) AS depense_max
FROM categories AS c
LEFT JOIN depenses AS d ON c.id = d.categorie_id
GROUP BY c.id, c.nom;

-- 4. Moyenne > 50 € : Alimentation (61.68) et Transport (70.67)
SELECT * FROM budget_categories
WHERE moyenne > 50;

-- 5. Total par moyen de paiement : carte, espèces, virement
DROP VIEW IF EXISTS depenses_par_moyen_paiement;

CREATE VIEW depenses_par_moyen_paiement AS
SELECT
    moyen_paiement,
    COUNT(*) AS nb_depenses,
    ROUND(SUM(montant), 2) AS total
FROM depenses
GROUP BY moyen_paiement;

SELECT * FROM depenses_par_moyen_paiement ORDER BY total DESC;

-- 6. Suppression
DROP VIEW depenses_par_moyen_paiement;
```

</details>
