---
title: "Les contraintes"
---

## Protéger ses données

Nos deux tables fonctionnent, mais elles acceptent n'importe quoi. Rien n'empêche
d'insérer une dépense sans montant, deux catégories nommées « Loisirs », ou une
dépense rattachée à une catégorie qui n'existe pas.

Les **contraintes** sont des règles déclarées dans le `CREATE TABLE`. La base les
vérifie à chaque écriture et **refuse** les données invalides. C'est une différence
de nature avec un `SELECT` de vérification : la contrainte n'oublie jamais.

### NOT NULL — Interdire les valeurs vides

```sql
CREATE TABLE exemple_categories (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    budget_mensuel REAL
);
```

Insérer sans nom provoque maintenant une erreur :

```sql
-- ❌ Erreur : NOT NULL constraint failed
INSERT INTO exemple_categories (id, budget_mensuel) VALUES (1, 300);

-- ✓ Correct
INSERT INTO exemple_categories (id, nom, budget_mensuel) VALUES (1, 'Alimentation', 300);
```

### UNIQUE — Interdire les doublons

Deux catégories nommées « Loisirs » rendraient tous nos regroupements
incompréhensibles :

```sql
CREATE TABLE exemple_categories2 (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    budget_mensuel REAL
);
```

```sql
INSERT INTO exemple_categories2 VALUES (1, 'Loisirs', 100);

-- ❌ Erreur : UNIQUE constraint failed
INSERT INTO exemple_categories2 VALUES (2, 'Loisirs', 150);
```

### DEFAULT — Valeur par défaut

`DEFAULT` fournit une valeur quand on n'en donne pas. Pratique pour éviter les
colonnes vides :

```sql
CREATE TABLE exemple_depenses (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    montant REAL NOT NULL,
    moyen_paiement TEXT NOT NULL DEFAULT 'carte'
);

-- On ne précise pas le moyen de paiement
INSERT INTO exemple_depenses (id, description, montant) VALUES (1, 'Courses', 42.00);

SELECT * FROM exemple_depenses;
```

| id  | description | montant | moyen_paiement |
| --- | ----------- | ------- | -------------- |
| 1   | Courses     | 42.0    | carte          |

Remarque la combinaison `NOT NULL DEFAULT 'carte'` : la colonne ne peut pas être
vide, **et** on n'est pas obligé de la renseigner. Les deux contraintes se
complètent.

### FOREIGN KEY — Garantir que la référence existe

C'est la contrainte la plus utile de notre projet. Une **clé étrangère** déclare
que `depenses.categorie_id` doit correspondre à un `categories.id` existant.

```sql
FOREIGN KEY (categorie_id) REFERENCES categories(id)
```

Attention, un piège classique : **SQLite ne vérifie pas les clés étrangères par
défaut.** Il faut l'activer, et le faire à chaque nouvelle connexion :

```sql
PRAGMA foreign_keys = ON;
```

Si tu oublies cette ligne, tes `FOREIGN KEY` sont purement décoratives — elles
documentent l'intention sans rien empêcher. Prends l'habitude de la mettre en tête
de tes scripts.

### La version définitive de nos tables

On a maintenant tout ce qu'il faut pour écrire le schéma correctement. Comme
`ALTER TABLE` ne sait pas ajouter une contrainte après coup (vu à l'étape 1), on
recrée les tables.

**Ce bloc est le jeu de données de référence des étapes 5, 6 et 7.** Il est
rejouable : tu peux le relancer à tout moment pour repartir d'une base propre.

```sql
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS depenses;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    budget_mensuel REAL NOT NULL DEFAULT 0
);

CREATE TABLE depenses (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    montant REAL NOT NULL,
    categorie_id INTEGER NOT NULL,
    date_depense TEXT NOT NULL,
    moyen_paiement TEXT NOT NULL DEFAULT 'carte',
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

INSERT INTO categories (id, nom, budget_mensuel) VALUES
(1, 'Alimentation', 300),
(2, 'Transport', 150),
(3, 'Loisirs', 100),
(4, 'Santé', 80),
(5, 'Restaurant', 120);

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

### Les contraintes en action

Maintenant, la base se défend :

```sql
-- ❌ NOT NULL : une dépense sans montant
INSERT INTO depenses (id, description, categorie_id, date_depense)
VALUES (99, 'Mystère', 1, '2024-03-01');

-- ❌ UNIQUE : la catégorie Loisirs existe déjà
INSERT INTO categories (id, nom, budget_mensuel) VALUES (6, 'Loisirs', 200);

-- ❌ FOREIGN KEY : la catégorie 42 n'existe pas
INSERT INTO depenses (id, description, montant, categorie_id, date_depense)
VALUES (99, 'Dépense orpheline', 10.00, 42, '2024-03-01');

-- ✓ Tout est valide, et moyen_paiement prend sa valeur par défaut
INSERT INTO depenses (id, description, montant, categorie_id, date_depense)
VALUES (99, 'Marché', 18.60, 1, '2024-03-02');

SELECT * FROM depenses WHERE id = 99;   -- moyen_paiement = 'carte'
DELETE FROM depenses WHERE id = 99;     -- on nettoie
```

La clé étrangère protège aussi dans l'autre sens — impossible de supprimer une
catégorie encore utilisée :

```sql
-- ❌ Erreur : des dépenses référencent encore cette catégorie
DELETE FROM categories WHERE id = 1;
```

C'est voulu : sans ce garde-fou, on se retrouverait avec des dépenses pointant
vers une catégorie disparue.

### Récapitulatif

| Contrainte    | Garantit que…                                             |
| ------------- | --------------------------------------------------------- |
| `PRIMARY KEY` | chaque ligne a un identifiant unique                      |
| `NOT NULL`    | la colonne est toujours renseignée                        |
| `UNIQUE`      | deux lignes n'ont pas la même valeur                      |
| `DEFAULT`     | une valeur est fournie si on n'en donne pas               |
| `FOREIGN KEY` | la valeur correspond à une ligne existante d'une autre table |

### Exercice

Pars du bloc de référence ci-dessus.

1. Vérifie que `PRAGMA foreign_keys = ON;` est actif, puis tente d'insérer une
   dépense avec `categorie_id = 99` : quelle erreur obtiens-tu ?
2. Tente d'ajouter une deuxième catégorie nommée « Transport » : quelle contrainte
   te bloque ?
3. Insère une dépense **sans** préciser `moyen_paiement`, puis vérifie la valeur
   qu'elle a reçue *(`carte`)*
4. Tente de supprimer la catégorie « Santé », puis explique pourquoi ça échoue.
   Que faudrait-il faire d'abord ?
5. Crée une table `abonnements` (id, libelle NOT NULL UNIQUE, montant_mensuel NOT
   NULL, categorie_id NOT NULL avec une FOREIGN KEY vers `categories`, actif
   INTEGER NOT NULL DEFAULT 1), insère deux abonnements valides et un invalide

<details markdown="1">
<summary>Voir les réponses</summary>

```sql
PRAGMA foreign_keys = ON;

-- 1. FOREIGN KEY constraint failed
INSERT INTO depenses (id, description, montant, categorie_id, date_depense)
VALUES (99, 'Test', 10.00, 99, '2024-03-01');

-- 2. UNIQUE constraint failed: categories.nom
INSERT INTO categories (id, nom, budget_mensuel) VALUES (6, 'Transport', 200);

-- 3. DEFAULT en action
INSERT INTO depenses (id, description, montant, categorie_id, date_depense)
VALUES (99, 'Marché', 18.60, 1, '2024-03-02');

SELECT moyen_paiement FROM depenses WHERE id = 99;   -- carte
DELETE FROM depenses WHERE id = 99;

-- 4. Échec : FOREIGN KEY constraint failed.
--    Les dépenses 8 et 15 (Pharmacie, Médecin) référencent la catégorie 4.
--    Il faudrait d'abord supprimer ou réaffecter ces dépenses.
SELECT * FROM depenses WHERE categorie_id = 4;   -- 2 lignes
DELETE FROM categories WHERE id = 4;             -- ❌

-- 5. Table abonnements
DROP TABLE IF EXISTS abonnements;

CREATE TABLE abonnements (
    id INTEGER PRIMARY KEY,
    libelle TEXT NOT NULL UNIQUE,
    montant_mensuel REAL NOT NULL,
    categorie_id INTEGER NOT NULL,
    actif INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- ✓ Valides (actif vaut 1 par défaut)
INSERT INTO abonnements (id, libelle, montant_mensuel, categorie_id) VALUES
(1, 'Netflix', 13.49, 3),
(2, 'Salle de sport', 35.00, 3);

-- ❌ Invalide : libellé en doublon
INSERT INTO abonnements (id, libelle, montant_mensuel, categorie_id)
VALUES (3, 'Netflix', 15.49, 3);

DROP TABLE abonnements;
```

</details>
