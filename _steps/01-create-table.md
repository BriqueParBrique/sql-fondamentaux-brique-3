---
title: "CREATE TABLE"
---

## Créer ses propres tables

Jusqu'ici, on a lu et interrogé des données existantes. Maintenant, on va apprendre à **créer nos propres tables** à partir de zéro.

### Le projet de ce niveau

Pendant tout ce niveau, on construit **un seul et même projet** : un suivi de
dépenses personnelles. À chaque étape, on enrichit la même base — on ne repart
jamais de zéro. À la fin, tu auras conçu une petite base de données complète et tu
sauras l'interroger.

Elle contiendra deux tables :

- `categories` : les postes de dépenses (Alimentation, Transport…), avec un budget mensuel
- `depenses` : chaque dépense, rattachée à une catégorie

### La syntaxe de base

```sql
CREATE TABLE nom_de_la_table (
    nom_colonne TYPE,
    nom_colonne TYPE,
    ...
);
```

### Les types de données en SQLite

| Type      | Description    | Exemple      |
| --------- | -------------- | ------------ |
| `INTEGER` | Nombre entier  | 42, -7, 2024 |
| `REAL`    | Nombre décimal | 3.14, 9.99   |
| `TEXT`    | Texte          | 'Bonjour'    |

### Et les dates ?

Tu remarqueras qu'il n'y a **pas de type date** dans cette liste. Ce n'est pas un
oubli : SQLite n'en a pas. On stocke donc les dates dans une colonne `TEXT`, au
format **`'AAAA-MM-JJ'`** (norme ISO 8601) : `'2024-01-15'`.

Pourquoi ce format précis, et pas `'15/01/2024'` ? Parce qu'écrite ainsi, une date
se trie **alphabétiquement** dans le bon ordre **chronologique** :

```sql
-- '2024-01-05' < '2024-01-22' est vrai, aussi bien alphabétiquement
-- que chronologiquement — donc ceci fonctionne :
ORDER BY date_depense
WHERE date_depense >= '2024-02-01'
```

Avec `'15/01/2024'`, un tri alphabétique commencerait par comparer les jours :
le 15 janvier passerait avant le 2 février, mais aussi avant le 2 janvier. Le tri
serait faux.

**Retiens la règle : toujours `AAAA-MM-JJ`.** On exploitera ce format à l'étape 6
pour regrouper les dépenses par mois.

### La clé primaire (PRIMARY KEY)

Chaque table a besoin d'un **identifiant unique** pour chaque ligne. C'est la **clé primaire** :

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    budget_mensuel REAL
);
```

- `id INTEGER PRIMARY KEY` : chaque catégorie a un numéro unique
- `budget_mensuel` : en euros, ce qu'on s'autorise à dépenser par mois

### La deuxième table

```sql
CREATE TABLE depenses (
    id INTEGER PRIMARY KEY,
    description TEXT,
    montant REAL,
    categorie_id INTEGER,
    date_depense TEXT
);
```

La colonne `categorie_id` contiendra l'`id` d'une ligne de `categories` : c'est la
**clé étrangère** que tu as rencontrée au niveau 2 avec les `JOIN`. Pour l'instant
rien n'empêche d'y mettre n'importe quel nombre — on y remédiera à l'étape 4.

Vérifions que les deux tables ont été créées :

```sql
-- En SQLite, on peut lister les tables
SELECT name FROM sqlite_master WHERE type = 'table';
```

### Modifier une table existante : ALTER TABLE

Tu viens de créer une table et tu réalises qu'il manque une colonne, ou qu'un nom
est mal orthographié. Faut-il tout supprimer et recommencer ? Non : `ALTER TABLE`
modifie une table **sans perdre les données qu'elle contient**.

**Ajouter une colonne** — notons comment chaque dépense a été payée :

```sql
ALTER TABLE depenses ADD COLUMN moyen_paiement TEXT;
```

Les lignes déjà présentes reçoivent la valeur vide (`NULL`) dans cette nouvelle
colonne.

**Renommer une colonne** :

```sql
ALTER TABLE depenses RENAME COLUMN date_depense TO date_de_la_depense;

-- On préfère finalement le nom court : on annule
ALTER TABLE depenses RENAME COLUMN date_de_la_depense TO date_depense;
```

**Renommer la table entière** :

```sql
ALTER TABLE depenses RENAME TO mes_depenses;
ALTER TABLE mes_depenses RENAME TO depenses;   -- on revient en arrière
```

C'est le réflexe à avoir dès que tu te dis « j'ai fait une erreur dans mon
`CREATE TABLE` ». Ici, la table est vide et tu pourrais la recréer sans
conséquence — mais dans la vraie vie une table contient des données qu'on ne peut
pas se permettre de jeter.

> **À noter** : l'`ALTER TABLE` de SQLite est volontairement limité. Il sait
> ajouter (`ADD COLUMN`), renommer (`RENAME`) et supprimer une colonne
> (`DROP COLUMN`), mais il ne sait ni changer le type d'une colonne existante, ni
> ajouter une contrainte après coup. Pour ça, il faut recréer la table — c'est
> exactement ce qu'on fera à l'étape 4.

### Supprimer une table

Si tu veux vraiment repartir de zéro :

```sql
DROP TABLE depenses;
```

Pour éviter une erreur si la table n'existe pas :

```sql
DROP TABLE IF EXISTS depenses;
```

`DROP TABLE IF EXISTS` est le réflexe à prendre au début de chaque script : il le
rend **rejouable**, c'est-à-dire qu'on peut l'exécuter deux fois de suite sans
erreur. Tu retrouveras ce motif au début de toutes les étapes suivantes.

> **Ordre de suppression** : `depenses` fait référence à `categories`. On supprime
> donc toujours `depenses` **d'abord**, `categories` ensuite — comme on démonte un
> mur avant les fondations.

### Bonnes pratiques

- Les noms de tables et colonnes en **minuscules**, avec des **underscores** (snake_case)
- Toujours une **clé primaire** (`id INTEGER PRIMARY KEY`)
- Choisir le **type le plus adapté** (INTEGER pour les entiers, REAL pour les décimaux, TEXT pour le reste)
- Les dates en **TEXT au format `AAAA-MM-JJ`**
- Des noms de colonnes **descriptifs** (`budget_mensuel` plutôt que `bm`)

### Exercice

1. Crée les deux tables `categories` et `depenses` telles que présentées ci-dessus
2. Vérifie qu'elles existent avec `SELECT name FROM sqlite_master WHERE type = 'table';` *(2 lignes)*
3. Ajoute à `depenses` une colonne `moyen_paiement` de type `TEXT` avec `ALTER TABLE`
4. Crée une table `abonnements` (id, nom, montant_mensuel, date_debut), puis renomme la colonne `nom` en `libelle`
5. Supprime la table `abonnements`, puis relance exactement la même commande de suppression : que se passe-t-il ? Comment l'éviter ?

<details>
<summary>Voir les réponses</summary>

```sql
-- 1. Les deux tables du projet
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
    date_depense TEXT
);

-- 2. Vérification : categories et depenses
SELECT name FROM sqlite_master WHERE type = 'table';

-- 3. Ajout d'une colonne
ALTER TABLE depenses ADD COLUMN moyen_paiement TEXT;

-- 4. Table abonnements + renommage de colonne
CREATE TABLE abonnements (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    montant_mensuel REAL,
    date_debut TEXT
);

ALTER TABLE abonnements RENAME COLUMN nom TO libelle;

-- 5. La première suppression fonctionne. La seconde échoue avec
--    « no such table: abonnements ». On l'évite avec IF EXISTS.
DROP TABLE abonnements;
DROP TABLE IF EXISTS abonnements;   -- ne provoque aucune erreur
```

</details>
