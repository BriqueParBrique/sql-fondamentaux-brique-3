---
title: "UPDATE et DELETE"
---

## Modifier et supprimer des données

Cette étape travaille sur les tables `categories` et `depenses` remplies à
l'étape 2. Si tu as besoin de les remettre à zéro, reprends les blocs de
l'étape 2.

### UPDATE — Modifier des lignes

`UPDATE` change les valeurs d'une ou plusieurs colonnes dans des lignes
existantes.

```sql
-- Netflix a augmenté ses tarifs
UPDATE depenses
SET montant = 15.49
WHERE id = 4;
```

On peut modifier plusieurs colonnes en même temps, séparées par des virgules :

```sql
UPDATE depenses
SET montant = 15.49, moyen_paiement = 'carte'
WHERE id = 4;
```

### LA RÈGLE LA PLUS IMPORTANTE

> **Ne jamais oublier le WHERE avec UPDATE ou DELETE !**

Sans `WHERE`, **toutes les lignes** sont modifiées :

```sql
-- ⚠️ DANGER : met TOUTES les dépenses à 15.49 €
UPDATE depenses SET montant = 15.49;

-- ✓ CORRECT : ne touche que la ligne 4
UPDATE depenses SET montant = 15.49 WHERE id = 4;
```

**Astuce de sécurité** : avant un `UPDATE`, teste ton `WHERE` avec un `SELECT`.
Les lignes affichées sont exactement celles qui seront modifiées.

```sql
-- 1. Qu'est-ce que je vais toucher ?
SELECT * FROM depenses WHERE id = 4;

-- 2. Seulement ensuite, modifier
UPDATE depenses SET montant = 15.49 WHERE id = 4;

-- 3. Vérifier le résultat
SELECT * FROM depenses WHERE id = 4;
```

### DELETE — Supprimer des lignes

```sql
-- Tu as résilié ton abonnement à la salle de sport
DELETE FROM depenses WHERE id = 11;
```

Même règle, avec des conséquences encore moins réversibles :

```sql
-- ⚠️ DANGER : vide toute la table
DELETE FROM depenses;

-- ✓ CORRECT
DELETE FROM depenses WHERE id = 11;
```

### Le filet de sécurité : les transactions

Le `SELECT` préalable est un bon réflexe, mais il ne répond pas à la question qui
compte vraiment : **« je viens de lancer la mauvaise requête, comment j'annule ? »**

C'est exactement le rôle d'une **transaction**. L'idée : ouvrir une parenthèse,
faire ses modifications, regarder le résultat, puis décider de la **valider** ou
de **tout annuler**.

Trois mots-clés :

| Mot-clé    | Effet                                                     |
| ---------- | --------------------------------------------------------- |
| `BEGIN`    | Ouvre la parenthèse — rien n'est encore définitif          |
| `COMMIT`   | Ferme la parenthèse en **validant** les modifications      |
| `ROLLBACK` | Ferme la parenthèse en **annulant tout** depuis le `BEGIN` |

Reprenons la catastrophe de tout à l'heure, mais dans une transaction :

```sql
BEGIN;

-- L'erreur : on a oublié le WHERE
UPDATE depenses SET montant = 15.49;

-- On vérifie… et on constate les dégâts : 18 lignes à 15.49 €
SELECT COUNT(*) FROM depenses WHERE montant = 15.49;

-- Ouf : on annule tout
ROLLBACK;

-- La table est intacte, comme si l'UPDATE n'avait jamais eu lieu
SELECT COUNT(*) FROM depenses WHERE montant = 15.49;
```

Et le cas où tout va bien :

```sql
BEGIN;

UPDATE depenses SET montant = 15.49 WHERE id = 4;

SELECT * FROM depenses WHERE id = 4;   -- c'est bien ce que je voulais

COMMIT;   -- maintenant c'est définitif
```

> **Après un `COMMIT`, il n'y a plus de retour en arrière possible.** `ROLLBACK` ne
> peut annuler que ce qui n'a pas encore été validé.

L'autre usage des transactions est le **tout ou rien** sur plusieurs requêtes. Si
tu dois enregistrer une dépense et mettre à jour un budget, tu ne veux pas que la
première réussisse et la seconde échoue :

```sql
BEGIN;
INSERT INTO depenses (description, montant, categorie_id, date_depense, moyen_paiement)
VALUES ('Courses', 30.00, 1, '2024-02-28', 'carte');
UPDATE categories SET budget_mensuel = 320 WHERE id = 1;
COMMIT;   -- les deux passent, ou aucune des deux
```

**Prends l'habitude d'encadrer tout `UPDATE` ou `DELETE` par un `BEGIN` … `COMMIT`.**
C'est deux mots à taper, et c'est ce qui distingue une erreur agaçante d'une
soirée à restaurer une sauvegarde.

### UPDATE avec des calculs

On peut utiliser la valeur actuelle d'une colonne dans le calcul :

```sql
-- Revoir tous les budgets à la hausse de 10 %
BEGIN;
UPDATE categories SET budget_mensuel = budget_mensuel * 1.1;
SELECT * FROM categories;
ROLLBACK;   -- finalement non
```

### DELETE avec des conditions complexes

Toutes les conditions vues au niveau 1 fonctionnent :

```sql
BEGIN;
-- Les petites dépenses de loisirs de janvier
DELETE FROM depenses
WHERE categorie_id = 3
  AND montant < 15
  AND date_depense LIKE '2024-01%';
ROLLBACK;
```

### Exercice

Travaille sur la base de l'étape 2 (5 catégories, 18 dépenses). **Encadre chaque
modification par une transaction** et termine par un `ROLLBACK` : la base doit être
intacte à la fin de l'exercice, pour que l'étape 4 reparte du bon état.

1. Passe le montant de la dépense « Abonnement Netflix » du 2024-01-15 à 15.49 €
   *(1 ligne modifiée)*
2. Change le moyen de paiement de toutes les dépenses de la catégorie Restaurant
   en `'carte'` *(3 lignes modifiées)*
3. Augmente de 20 € le budget mensuel de la catégorie Loisirs *(1 ligne)*
4. Supprime toutes les dépenses de moins de 15 €. **Réfléchis avant de répondre** :
   il y en avait 3 au départ, combien en reste-t-il après ta modification de la
   question 1 ? *(2 lignes supprimées)*
5. Sans faire de `COMMIT`, annule tout avec `ROLLBACK` et vérifie que tu as bien
   à nouveau 18 dépenses et un budget Loisirs à 100

<details markdown="1">
<summary>Voir les réponses</summary>

```sql
BEGIN;

-- 1. Netflix de janvier. On vise l'id 4, ou bien :
SELECT * FROM depenses
WHERE description = 'Abonnement Netflix' AND date_depense = '2024-01-15';

UPDATE depenses SET montant = 15.49
WHERE description = 'Abonnement Netflix' AND date_depense = '2024-01-15';

-- 2. Moyen de paiement des restaurants (categorie_id = 5)
UPDATE depenses SET moyen_paiement = 'carte' WHERE categorie_id = 5;

-- 3. Budget Loisirs +20 €
UPDATE categories SET budget_mensuel = budget_mensuel + 20 WHERE nom = 'Loisirs';

-- 4. Les dépenses de moins de 15 € : Netflix ×2 (13.49) et Cinéma (11.50).
--    Attention : après l'étape 1, le Netflix de janvier est passé à 15.49 et
--    n'est donc plus concerné. Il en reste 2.
SELECT * FROM depenses WHERE montant < 15;   -- toujours vérifier avant
DELETE FROM depenses WHERE montant < 15;

-- 5. On annule tout
ROLLBACK;

-- Vérifications : la base est comme avant
SELECT COUNT(*) FROM depenses;                          -- 18
SELECT budget_mensuel FROM categories WHERE nom = 'Loisirs';  -- 100.0
```

</details>
