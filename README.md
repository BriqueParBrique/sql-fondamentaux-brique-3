# SQL Fondamentaux — Niveau 3

> Apprendre à écrire et structurer une base de données avec SQL — [BriqueParBrique](https://briqueparbrique.github.io)

Ce dépôt contient le parcours d'apprentissage « SQL Fondamentaux — Niveau 3 »,
conçu comme un mini-onboarding en sept étapes pour passer de la lecture à
l'**écriture** : créer ses tables, les alimenter, les protéger et les interroger
finement.

**Site** : [briqueparbrique.github.io/sql-fondamentaux-brique-3](https://briqueparbrique.github.io/sql-fondamentaux-brique-3/)

**Prérequis** : les niveaux [1](https://briqueparbrique.github.io/sql-fondamentaux-brique-1/)
et [2](https://briqueparbrique.github.io/sql-fondamentaux-brique-2/)
(`SELECT`, `WHERE`, `ORDER BY`, agrégations, `GROUP BY`, `JOIN`).

## Parcours

1. CREATE TABLE
2. INSERT INTO
3. UPDATE et DELETE
4. Les contraintes
5. Les sous-requêtes
6. Les vues (CREATE VIEW)
7. Mini-projet final

Le niveau est construit comme **un seul projet fil rouge** : un suivi de dépenses
personnelles (`categories`, `depenses`, puis `budgets`). Chaque étape enrichit la
même base — on ne repart jamais de zéro, et le mini-projet final consiste à
répondre à une question que la base ne savait pas encore traiter.

Le bloc de référence de l'**étape 4** est rejouable : il remet la base dans l'état
attendu par les étapes 5, 6 et 7.

À la fin, on sait créer et faire évoluer des tables (`CREATE TABLE`,
`ALTER TABLE`), écrire et corriger des données (`INSERT`, `UPDATE`, `DELETE`),
travailler sans risque grâce aux transactions (`BEGIN`, `COMMIT`, `ROLLBACK`),
poser des garde-fous (`NOT NULL`, `UNIQUE`, `DEFAULT`, `FOREIGN KEY`), imbriquer
des questions (sous-requêtes, y compris corrélées) et nommer une requête complexe
(`CREATE VIEW`).

## Niveau précédent

[SQL Fondamentaux — Niveau 2](https://briqueparbrique.github.io/sql-fondamentaux-brique-2/) :
agréger, regrouper et croiser plusieurs tables.

C'est le dernier niveau du parcours SQL Fondamentaux.

## Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour savoir comment améliorer ce parcours.

## Développement

Le site utilise [Jekyll](https://jekyllrb.com/) et est hébergé sur GitHub Pages. Consultez [DEVELOPER.md](DEVELOPER.md) pour mettre en place l'environnement de développement local.

## Licence

Ce projet est sous licence [MIT](LICENSE).
