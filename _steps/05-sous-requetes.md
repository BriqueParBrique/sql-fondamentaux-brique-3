---
title: "Les sous-requêtes"
---

## Imbriquer des requêtes

Une **sous-requête** est un `SELECT` placé à l'intérieur d'un autre `SELECT`. C'est
comme poser une question dont la réponse sert à poser la question suivante.

> **Jeu de données** : cette étape utilise les tables `categories` et `depenses`
> dans leur version définitive. Si tu as un doute sur leur état, relance le bloc de
> référence de **l'étape 4** — il est rejouable et remet tout d'aplomb.

### Le problème que ça résout

Souviens-toi du niveau 2 : `AVG(montant)` donne la moyenne, mais pas les lignes.
Comment afficher les dépenses **au-dessus de la moyenne** ? Il faudrait connaître
la moyenne avant de filtrer… et c'est impossible en une seule passe.

On pourrait le faire en deux temps :

```sql
-- 1. Trouver la moyenne
SELECT AVG(montant) FROM depenses;   -- 45.176666…

-- 2. Recopier le nombre à la main
SELECT description, montant FROM depenses WHERE montant > 45.18;
```

Ça marche, mais c'est fragile : dès qu'une dépense change, le nombre recopié est
faux. La sous-requête branche directement les deux :

```sql
SELECT description, montant
FROM depenses
WHERE montant > (SELECT AVG(montant) FROM depenses);
```

Comment ça marche :

1. SQL exécute d'abord la sous-requête entre parenthèses, qui renvoie **une seule
   valeur** : `45.1766…`
2. Puis la requête principale se comporte comme si tu avais écrit `WHERE montant > 45.1766…`

La requête reste juste, quoi qu'il arrive aux données.

### Sous-requête qui retourne une seule valeur

C'est le cas le plus simple, et celui qui répond enfin à la question laissée en
suspens au niveau 2 : *« quelle est la ligne qui porte le maximum ? »*

```sql
-- La dépense la plus chère, avec sa description
SELECT description, montant, date_depense
FROM depenses
WHERE montant = (SELECT MAX(montant) FROM depenses);
```

| description     | montant | date_depense |
| --------------- | ------- | ------------ |
| Train Paris-Lyon | 89.0    | 2024-01-22   |

Avantage sur le `ORDER BY … LIMIT 1` du niveau 2 : s'il y a **plusieurs** lignes à
égalité au maximum, celles-ci sont **toutes** renvoyées, au lieu d'une seule choisie
arbitrairement.

### Sous-requête avec IN

Quand la sous-requête renvoie **plusieurs valeurs**, on ne peut plus utiliser `=`.
On utilise `IN`, déjà rencontré au niveau 1 :

```sql
-- Les dépenses des catégories dont le budget dépasse 100 €
SELECT description, montant, categorie_id
FROM depenses
WHERE categorie_id IN (
    SELECT id FROM categories WHERE budget_mensuel > 100
);
```

La sous-requête renvoie les `id` 1, 2 et 5 (Alimentation, Transport, Restaurant),
et la requête principale garde les dépenses de ces trois catégories.

On peut aussi appuyer le `IN` sur un regroupement :

```sql
-- Les dépenses des catégories qui comptent plus de 4 dépenses
SELECT description, montant
FROM depenses
WHERE categorie_id IN (
    SELECT categorie_id FROM depenses
    GROUP BY categorie_id
    HAVING COUNT(*) > 4
);
```

### `NOT IN` : ce qui n'est *pas* dans la liste

```sql
-- Les catégories dans lesquelles on n'a rien dépensé en février
SELECT nom FROM categories
WHERE id NOT IN (
    SELECT categorie_id FROM depenses
    WHERE date_depense LIKE '2024-02%'
);
```

Ici le résultat est vide : chaque catégorie a au moins une dépense en février.
Essaie avec `'2024-03%'` pour voir les cinq catégories ressortir.

> **Piège** : si la sous-requête d'un `NOT IN` renvoie ne serait-ce qu'un seul
> `NULL`, le résultat global est vide, quoi qu'il arrive. C'est une bizarrerie de la
> logique à trois valeurs de SQL. Nos colonnes sont `NOT NULL`, donc on est
> tranquilles — mais retiens que `NOT IN` et les valeurs vides font mauvais ménage.

### Sous-requête dans FROM

Une sous-requête peut aussi tenir le rôle d'une **table temporaire**. Il faut alors
lui donner un alias (`AS totaux` ci-dessous) :

```sql
-- Total par catégorie, puis on ne garde que les gros postes
SELECT nom, total
FROM (
    SELECT c.nom, SUM(d.montant) AS total
    FROM categories AS c
    INNER JOIN depenses AS d ON c.id = d.categorie_id
    GROUP BY c.id, c.nom
) AS totaux
WHERE total > 200
ORDER BY total DESC;
```

| nom          | total  |
| ------------ | ------ |
| Alimentation | 308.4  |
| Transport    | 212.0  |

C'est une alternative au `HAVING` : on calcule d'abord, on filtre ensuite. Quand le
calcul devient long, cette forme se lit souvent mieux — et c'est exactement l'idée
qu'on poussera plus loin à l'étape 6 avec les vues.

### Comparer avec la moyenne de son propre groupe

Voici la sous-requête la plus puissante — et la plus subtile. Question : quelles
dépenses sont au-dessus de la moyenne **de leur catégorie** ? Une dépense
alimentaire de 60 € n'est pas « grosse » de la même façon qu'un cinéma de 60 €.

```sql
SELECT d.description, d.montant, c.nom AS categorie
FROM depenses AS d
INNER JOIN categories AS c ON d.categorie_id = c.id
WHERE d.montant > (
    SELECT AVG(d2.montant)
    FROM depenses AS d2
    WHERE d2.categorie_id = d.categorie_id
);
```

Regarde bien la dernière ligne : `d2.categorie_id = d.categorie_id`. La
sous-requête utilise `d`, c'est-à-dire **la ligne en cours d'examen** dans la
requête principale. On appelle ça une **sous-requête corrélée**.

Concrètement, SQL procède ligne par ligne :

1. Il prend la dépense « Courses Carrefour » (87.50 €, Alimentation)
2. Il calcule la moyenne des dépenses **d'Alimentation** uniquement : 61.68 €
3. 87.50 > 61.68 → la ligne est gardée
4. Il passe à la dépense suivante et recalcule la moyenne de *sa* catégorie

Les deux alias `d` et `d2` sont indispensables : sans eux, impossible de distinguer
« la table de la requête principale » de « la table de la sous-requête », alors
qu'il s'agit de la même table `depenses`.

### Exercice

Le nombre de lignes attendu est indiqué entre parenthèses.

1. Affiche les dépenses dont le montant est supérieur à la moyenne générale *(9 lignes)*
2. Affiche la dépense la moins chère, avec sa description, en utilisant une sous-requête *(1 ligne)*
3. Affiche les dépenses de la catégorie qui a le plus grand nombre de dépenses.
   **Attention** : deux catégories sont à égalité avec 5 dépenses chacune — pense
   au critère de départage du niveau 1 *(5 lignes)*
4. Affiche le nom des catégories dans lesquelles on a dépensé plus de 150 € au
   total, en utilisant une sous-requête dans `FROM` *(2 lignes)*
5. Affiche les dépenses supérieures à la moyenne de leur catégorie, avec le nom de
   la catégorie *(8 lignes — sous-requête corrélée)*
6. Affiche les catégories dont **aucune** dépense n'a été payée en espèces
   *(2 lignes — indice : `NOT IN`)*

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Au-dessus de la moyenne générale (45.18 € environ)
SELECT description, montant
FROM depenses
WHERE montant > (SELECT AVG(montant) FROM depenses);

-- 2. La dépense la moins chère
SELECT description, montant
FROM depenses
WHERE montant = (SELECT MIN(montant) FROM depenses);

-- 3. Les dépenses de la catégorie la plus fréquente.
--    Alimentation (id 1) et Loisirs (id 3) ont toutes deux 5 dépenses : sans
--    le `, categorie_id` de départage, on ne saurait pas laquelle est
--    retenue. Ici on choisit le plus petit id, donc Alimentation.
SELECT description, montant
FROM depenses
WHERE categorie_id = (
    SELECT categorie_id FROM depenses
    GROUP BY categorie_id
    ORDER BY COUNT(*) DESC, categorie_id
    LIMIT 1
);

-- 4. Catégories à plus de 150 € dépensés
SELECT nom
FROM (
    SELECT c.nom, SUM(d.montant) AS total
    FROM categories AS c
    INNER JOIN depenses AS d ON c.id = d.categorie_id
    GROUP BY c.id, c.nom
) AS totaux
WHERE total > 150;

-- 5. Au-dessus de la moyenne de leur catégorie
SELECT d.description, d.montant, c.nom AS categorie
FROM depenses AS d
INNER JOIN categories AS c ON d.categorie_id = c.id
WHERE d.montant > (
    SELECT AVG(d2.montant)
    FROM depenses AS d2
    WHERE d2.categorie_id = d.categorie_id
);

-- 6. Catégories sans aucun paiement en espèces
SELECT nom FROM categories
WHERE id NOT IN (
    SELECT categorie_id FROM depenses WHERE moyen_paiement = 'espèces'
);
```

</details>
