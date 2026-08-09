---
title: "Mini-projet final"
---

## Mini-projet : le tableau de bord budgétaire

C'est le dernier mini-projet des trois niveaux SQL Fondamentaux ! Tu as construit
une base de dépenses au fil des six étapes. Il reste une question à laquelle elle
ne sait **pas** répondre — et c'est la plus intéressante.

> **Point de départ** : les tables `categories` et `depenses` dans leur version
> définitive (bloc de référence de l'étape 4). Vérifie avant de commencer :
>
> ```sql
> SELECT COUNT(*) FROM categories;   -- 5
> SELECT COUNT(*) FROM depenses;     -- 18
> ```

### Le problème

La table `categories` contient une colonne `budget_mensuel`. On pourrait croire
qu'il suffit de comparer le total dépensé à cette colonne :

```sql
-- ⚠️ Cette requête a l'air juste. Elle est fausse.
SELECT c.nom, ROUND(SUM(d.montant), 2) AS total, c.budget_mensuel
FROM categories AS c
INNER JOIN depenses AS d ON c.id = d.categorie_id
GROUP BY c.id, c.nom, c.budget_mensuel
HAVING SUM(d.montant) > c.budget_mensuel;
```

| nom          | total  | budget_mensuel |
| ------------ | ------ | -------------- |
| Alimentation | 308.4  | 300.0          |
| Transport    | 212.0  | 150.0          |
| Loisirs      | 135.48 | 100.0          |

Trois catégories en dépassement ? Regarde de plus près. Notre base contient
**deux mois** de dépenses. Ce `SUM(d.montant)` additionne janvier **et** février,
puis compare le résultat à un budget **mensuel**. On compare deux mois de dépenses
à un mois de budget : forcément, ça déborde.

Le cas d'Alimentation le montre bien : 149.80 € en janvier, 158.60 € en février.
Elle n'a dépassé son budget de 300 € **aucun des deux mois**. Elle n'a rien à faire
dans cette liste.

**La vraie question est mensuelle** : quelle catégorie a dépassé son budget, et
quel mois ? C'est ce que tu vas construire.

### Étape 1 — La table des budgets mensuels

Un budget peut changer d'un mois sur l'autre (on se serre la ceinture en janvier
après les fêtes). Une seule colonne dans `categories` ne peut pas représenter ça :
il faut une table dédiée, avec une ligne par catégorie **et par mois**.

**Défi 1** : Crée une table `budgets` avec :

- `id`, clé primaire
- `categorie_id`, entier obligatoire, clé étrangère vers `categories(id)`
- `mois`, texte obligatoire, au format `'AAAA-MM'`
- `montant_prevu`, réel obligatoire
- une contrainte garantissant qu'il ne peut pas y avoir **deux budgets pour la même
  catégorie le même mois**

> Pour la dernière contrainte, `UNIQUE` peut porter sur **plusieurs colonnes à la
> fois** : `UNIQUE (colonne_a, colonne_b)`. C'est la même idée que `UNIQUE` sur une
> colonne, appliquée à la combinaison des deux.

**Défi 2** : Remplis-la pour janvier et février 2024, en reprenant les budgets de
`categories` — sauf pour Restaurant, où l'on garde 120 € en janvier mais où on se
restreint à 60 € en février. *(10 lignes)*

> À partir de maintenant, c'est la table `budgets` qui fait référence.
> `categories.budget_mensuel` reste utile comme valeur par défaut quand on crée une
> catégorie, mais c'est `budgets` qui porte la vérité mois par mois.

### Étape 2 — Modifier les données

**Défi 3** : Netflix a augmenté : passe les **deux** dépenses « Abonnement Netflix »
à 15.49 €. Encadre la modification d'une transaction et valide-la. *(2 lignes modifiées)*

**Défi 4** : Tu as résilié la salle de sport : supprime cette dépense. Là encore,
transaction. *(1 ligne supprimée)*

### Étape 3 — Le tableau de bord

**Défi 5** : Crée une vue `suivi_mensuel` qui affiche, pour **chaque couple
catégorie × mois** : le nom de la catégorie, le mois, le total dépensé, le montant
prévu, et l'écart (prévu − dépensé). *(10 lignes)*

**Défi 6** : Utilise `suivi_mensuel` pour lister les dépassements. *(2 lignes)*

**Défi 7** : Toujours avec `suivi_mensuel`, quel est le mois le plus économe, c'est-à-dire
celui dont l'écart total est le plus favorable ? *(1 ligne)*

**Défi 8** : Avec une sous-requête corrélée, affiche les dépenses supérieures à la
moyenne de leur catégorie, avec le nom de la catégorie. *(7 lignes)*

### Solutions

<details markdown="1">
<summary>Voir toutes les solutions</summary>

```sql
PRAGMA foreign_keys = ON;

-- Défi 1 : la table des budgets mensuels
DROP TABLE IF EXISTS budgets;

CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    categorie_id INTEGER NOT NULL,
    mois TEXT NOT NULL,
    montant_prevu REAL NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categories(id),
    UNIQUE (categorie_id, mois)
);

-- Défi 2 : deux mois de budgets
INSERT INTO budgets (id, categorie_id, mois, montant_prevu) VALUES
(1,  1, '2024-01', 300),
(2,  2, '2024-01', 150),
(3,  3, '2024-01', 100),
(4,  4, '2024-01',  80),
(5,  5, '2024-01', 120),   -- Restaurant : budget normal en janvier
(6,  1, '2024-02', 300),
(7,  2, '2024-02', 150),
(8,  3, '2024-02', 100),
(9,  4, '2024-02',  80),
(10, 5, '2024-02',  60);   -- Restaurant : on se restreint en février

-- La contrainte UNIQUE en action :
-- ❌ UNIQUE constraint failed: budgets.categorie_id, budgets.mois
-- INSERT INTO budgets (id, categorie_id, mois, montant_prevu)
-- VALUES (11, 1, '2024-01', 400);

-- Défi 3 : les deux Netflix
BEGIN;
SELECT * FROM depenses WHERE description = 'Abonnement Netflix';   -- vérifier d'abord
UPDATE depenses SET montant = 15.49 WHERE description = 'Abonnement Netflix';
COMMIT;

-- Défi 4 : résiliation de la salle de sport
BEGIN;
SELECT * FROM depenses WHERE description = 'Abonnement salle de sport';
DELETE FROM depenses WHERE description = 'Abonnement salle de sport';
COMMIT;

-- Défi 5 : la vue de suivi.
--    La jointure se fait sur DEUX conditions : même catégorie ET même mois.
--    C'est ce qui rend la comparaison correcte.
DROP VIEW IF EXISTS suivi_mensuel;

CREATE VIEW suivi_mensuel AS
SELECT
    c.nom AS categorie,
    b.mois,
    ROUND(COALESCE(SUM(d.montant), 0), 2) AS total_depense,
    b.montant_prevu,
    ROUND(b.montant_prevu - COALESCE(SUM(d.montant), 0), 2) AS ecart
FROM budgets AS b
INNER JOIN categories AS c ON b.categorie_id = c.id
LEFT JOIN depenses AS d
       ON d.categorie_id = b.categorie_id
      AND substr(d.date_depense, 1, 7) = b.mois
GROUP BY b.id, c.nom, b.mois, b.montant_prevu;

SELECT * FROM suivi_mensuel ORDER BY mois, categorie;

-- Défi 6 : les dépassements. Un écart négatif = budget dépassé.
SELECT categorie, mois, total_depense, montant_prevu, ecart
FROM suivi_mensuel
WHERE ecart < 0
ORDER BY ecart;

-- Défi 7 : le mois le plus économe
SELECT mois, ROUND(SUM(ecart), 2) AS ecart_total
FROM suivi_mensuel
GROUP BY mois
ORDER BY ecart_total DESC
LIMIT 1;

-- Défi 8 : sous-requête corrélée
SELECT d.description, d.montant, c.nom AS categorie
FROM depenses AS d
INNER JOIN categories AS c ON d.categorie_id = c.id
WHERE d.montant > (
    SELECT AVG(d2.montant)
    FROM depenses AS d2
    WHERE d2.categorie_id = d.categorie_id
)
ORDER BY c.nom, d.montant DESC;
```

</details>

### Deux points à retenir de ce projet

**`LEFT JOIN` sur deux conditions.** La vue `suivi_mensuel` part de `budgets` et va
chercher les dépenses correspondantes, en joignant sur la catégorie **et** sur le
mois. Partir de `budgets` avec un `LEFT JOIN` garantit qu'un mois sans aucune
dépense apparaît quand même, avec 0 — c'est pour ça que `COALESCE(SUM(…), 0)` est
là : `SUM` d'un ensemble vide vaut `NULL`, pas `0`, et `COALESCE` remplace cette
valeur vide par zéro.

**La bonne granularité.** L'erreur du début n'était pas une faute de syntaxe : la
requête s'exécutait sans broncher et renvoyait un tableau crédible. Elle comparait
simplement deux choses qui n'étaient pas comparables. C'est le genre de bug qu'aucun
message d'erreur ne signale — seule la relecture de ce que *signifient* les chiffres
permet de l'attraper.

### Félicitations !

Tu as terminé les **3 niveaux de SQL Fondamentaux** ! Voici un résumé de tout ce que tu as appris :

**Niveau 1 — Lire les données :**

- `SELECT` / `FROM` pour interroger une table, `DISTINCT` pour dédoublonner
- `WHERE` pour filtrer : `=`, `<`, `>`, `!=`, `BETWEEN`, `IN`, `LIKE`, `AND`, `OR`
- `ORDER BY` et `LIMIT` pour trier et limiter, avec un critère de départage

**Niveau 2 — Transformer et combiner :**

- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` pour agréger
- `GROUP BY` et `HAVING` pour regrouper et filtrer des groupes
- `INNER JOIN` et `LEFT JOIN` pour croiser les tables, et `NULL` pour les valeurs absentes
- Les alias `AS`, puis `ROUND`, `||` et `SUM(CASE WHEN …)` pour présenter un résultat

**Niveau 3 — Écrire et structurer :**

- `CREATE TABLE` et `ALTER TABLE` pour concevoir et faire évoluer ses tables
- `INSERT INTO`, `UPDATE`, `DELETE` pour alimenter et corriger les données
- `BEGIN` / `COMMIT` / `ROLLBACK` pour ne jamais craindre un `UPDATE`
- Les contraintes (`NOT NULL`, `UNIQUE`, `DEFAULT`, `FOREIGN KEY`) pour que la base refuse les données invalides
- Les sous-requêtes, y compris corrélées, pour imbriquer les questions
- Les vues pour nommer et réutiliser une requête complexe

Tu as maintenant des bases solides pour travailler avec n'importe quelle base de
données SQL. Les commandes changent peu d'un moteur à l'autre — PostgreSQL, MySQL,
SQL Server parlent presque le même langage que le SQLite que tu viens d'utiliser.

Bravo !
