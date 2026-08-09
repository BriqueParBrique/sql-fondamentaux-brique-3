---
title: "INSERT INTO"
---

## Ajouter des données

Une table vide n'est pas très utile ! `INSERT INTO` permet d'ajouter des lignes.

### Repartir des bonnes tables

Pour que tout le monde parte du même point, recrée les deux tables du projet :

```sql
DROP TABLE IF EXISTS depenses;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    budget_mensuel REAL
);

CREATE TABLE depenses (
    id INTEGER PRIMARY KEY,
    description TEXT,
    montant REAL,
    categorie_id INTEGER,
    date_depense TEXT,
    moyen_paiement TEXT
);
```

### Insérer une ligne

```sql
INSERT INTO categories (id, nom, budget_mensuel)
VALUES (1, 'Alimentation', 300);
```

Vérifie :

```sql
SELECT * FROM categories;
```

### Insérer sans préciser les colonnes

Si tu donnes une valeur pour **toutes** les colonnes, dans l'ordre de création, tu
peux omettre la liste des colonnes :

```sql
INSERT INTO categories VALUES (2, 'Transport', 150);
```

La forme avec les noms de colonnes est **recommandée** : elle est plus lisible et
elle continue de fonctionner si quelqu'un ajoute une colonne à la table plus tard.

### Insérer plusieurs lignes en une fois

On sépare les groupes de valeurs par des virgules :

```sql
INSERT INTO categories (id, nom, budget_mensuel) VALUES
(3, 'Loisirs', 100),
(4, 'Santé', 80),
(5, 'Restaurant', 120);
```

Nos cinq catégories sont en place :

| id  | nom          | budget_mensuel |
| --- | ------------ | -------------- |
| 1   | Alimentation | 300.0          |
| 2   | Transport    | 150.0          |
| 3   | Loisirs      | 100.0          |
| 4   | Santé        | 80.0           |
| 5   | Restaurant   | 120.0          |

### Remplir la table des dépenses

Passons aux dépenses : deux mois de janvier et février 2024. Note bien que
`categorie_id` reprend les `id` du tableau ci-dessus — `1` pour Alimentation,
`2` pour Transport, etc.

```sql
INSERT INTO depenses (id, description, montant, categorie_id, date_depense, moyen_paiement) VALUES
(1,  'Courses Carrefour',         87.50, 1, '2024-01-05', 'carte'),
(2,  'Essence',                   65.00, 2, '2024-01-08', 'carte'),
(3,  'Restaurant italien',        42.00, 5, '2024-01-12', 'carte'),
(4,  'Abonnement Netflix',        13.49, 3, '2024-01-15', 'virement'),
(5,  'Courses Leclerc',           62.30, 1, '2024-01-19', 'carte'),
(6,  'Train Paris-Lyon',          89.00, 2, '2024-01-22', 'carte'),
(7,  'Cinéma',                    11.50, 3, '2024-01-25', 'espèces'),
(8,  'Pharmacie',                 23.80, 4, '2024-01-28', 'carte'),
(9,  'Restaurant japonais',       38.00, 5, '2024-02-02', 'carte'),
(10, 'Courses Monoprix',          45.20, 1, '2024-02-05', 'carte'),
(11, 'Abonnement salle de sport', 35.00, 3, '2024-02-08', 'virement'),
(12, 'Essence',                   58.00, 2, '2024-02-12', 'carte'),
(13, 'Courses bio',               53.40, 1, '2024-02-15', 'espèces'),
(14, 'Abonnement Netflix',        13.49, 3, '2024-02-15', 'virement'),
(15, 'Médecin',                   25.00, 4, '2024-02-18', 'carte'),
(16, 'Pizzeria',                  28.50, 5, '2024-02-22', 'espèces'),
(17, 'Concert',                   62.00, 3, '2024-02-24', 'carte'),
(18, 'Courses Grand Frais',       60.00, 1, '2024-02-27', 'carte');
```

Vérifie :

```sql
SELECT COUNT(*) FROM depenses;
```

Tu devrais obtenir **18**.

### L'apostrophe dans les textes

Le caractère `'` sert à délimiter le texte. Pour insérer un texte qui **contient**
une apostrophe, on la double :

```sql
-- 'Ticket d''entrée' insère « Ticket d'entrée »
INSERT INTO depenses (id, description, montant, categorie_id, date_depense, moyen_paiement)
VALUES (19, 'Ticket d''entrée musée', 12.00, 3, '2024-02-28', 'espèces');
```

Si tu oublies de la doubler, SQL considère que le texte s'arrête à l'apostrophe et
tu obtiens une erreur de syntaxe.

### Auto-incrémentation de l'id

Avec SQLite, une colonne `INTEGER PRIMARY KEY` sait se remplir toute seule : si tu
ne donnes pas d'`id`, SQLite attribue le plus grand `id` existant plus un.

```sql
-- Pas d'id : SQLite le génère (ici 20)
INSERT INTO depenses (description, montant, categorie_id, date_depense, moyen_paiement)
VALUES ('Boulangerie', 8.40, 1, '2024-02-29', 'espèces');
```

C'est la façon habituelle de travailler : on laisse la base gérer les
identifiants. On ne les écrit à la main que pour préparer un jeu de données de
démonstration, comme ci-dessus.

### Remettre la base dans l'état de départ

Les deux derniers exemples ont ajouté deux lignes (`19` et `20`). Les étapes
suivantes supposent qu'il y en a exactement 18 — supprimons-les :

```sql
DELETE FROM depenses WHERE id > 18;
SELECT COUNT(*) FROM depenses;   -- 18
```

(`DELETE` est justement le sujet de l'étape suivante.)

### Exercice

1. Recrée les deux tables et insère les 5 catégories, puis les 18 dépenses ci-dessus
2. Vérifie tes insertions : `SELECT COUNT(*) FROM categories;` *(5)* et `SELECT COUNT(*) FROM depenses;` *(18)*
3. Insère une dépense « Abonnement d'électricité » de 42.90 € en Alimentation le 2024-02-20, payée par virement — attention à l'apostrophe
4. Insère une dépense sans préciser l'`id`, et vérifie quel `id` SQLite lui a donné
5. Combien as-tu dépensé au total en février 2024 ? *(indice : `WHERE date_depense LIKE '2024-02%'`, et n'oublie pas que tu viens d'ajouter deux lignes)*

<details markdown="1">
<summary>Voir les réponses</summary>

```sql
-- 1 et 2 : voir les blocs INSERT ci-dessus, puis
SELECT COUNT(*) FROM categories;   -- 5
SELECT COUNT(*) FROM depenses;     -- 18

-- 3. Apostrophe doublée dans « d'électricité »
INSERT INTO depenses (id, description, montant, categorie_id, date_depense, moyen_paiement)
VALUES (21, 'Abonnement d''électricité', 42.90, 1, '2024-02-20', 'virement');

-- 4. Sans id : SQLite prend le plus grand id existant + 1, donc 22
INSERT INTO depenses (description, montant, categorie_id, date_depense, moyen_paiement)
VALUES ('Café', 3.20, 5, '2024-02-25', 'espèces');

SELECT * FROM depenses ORDER BY id DESC LIMIT 1;

-- 5. Total de février
SELECT SUM(montant) FROM depenses
WHERE date_depense LIKE '2024-02%';

-- Puis on nettoie pour retrouver les 18 lignes de référence
DELETE FROM depenses WHERE id > 18;
```

</details>
