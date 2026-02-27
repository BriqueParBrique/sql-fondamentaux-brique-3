<!-- Managed by BriqueParBrique/nouvelle-brique — do not edit in brick repos -->

# Contribuer

Merci de votre intérêt pour ce parcours ! Toute contribution est la bienvenue.

## Améliorer une étape existante

- Corrigez le contenu ou améliorez la pédagogie
- Les étapes se trouvent dans le dossier `_steps/`
- Chaque fichier Markdown correspond à une étape du parcours

## Ajouter une étape

1. Forkez le dépôt
2. Créez un fichier dans `_steps/` (ex : `04-nom-etape.md`) avec le front matter :

   ```yaml
   ---
   title: "Titre de l'étape"
   ---
   ```

3. Ajoutez l'entrée correspondante dans `_data/steps.yml` :

   ```yaml
   - title: "Titre de l'étape"
     file: "04-nom-etape"
   ```

4. Testez localement avec `just serve` (voir [DEVELOPER.md](DEVELOPER.md))
5. Ouvrez une Pull Request

## Améliorer le site

- Corrections de bugs, améliorations de style ou d'accessibilité
- Testez localement avant de soumettre

## Conventions

- Les messages de commit sont en anglais
- Les contenus pédagogiques sont en français
- Gardez les choses simples : une étape = un sujet, un pas à la fois

## Licence

En contribuant, vous acceptez que vos contributions soient publiées sous la [licence MIT](LICENSE).
