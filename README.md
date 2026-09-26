# Projet Tailwind CSS

Petit projet d'apprentissage pour découvrir **Tailwind CSS**.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/)
- `npm` (installé avec Node.js)

## Installation

Depuis la racine du projet, installez les dépendances avec :

```bash
npm install
```

## Lancer le projet

Le projet utilise Tailwind pour générer le fichier CSS dans `dist/style.css`.

### 1. Générer le CSS en mode développement

Dans un premier terminal, lancez :

```bash
npm run dev
```

Cette commande surveille les modifications du fichier `assets/styles/main.css` et régénère automatiquement
`dist/style.css`.

### 2. Lancer un serveur local

Dans un second terminal, lancez :

```bash
npm run serve
```

Ensuite, ouvrez votre navigateur à l'adresse affichée dans le terminal (généralement `http://localhost:3000`).

## Structure utile

- `assets/styles/main.css` : fichier source Tailwind
- `dist/style.css` : fichier CSS généré
- `index.html` : page d'exemple

## Remarque

Si le style ne s'affiche pas, vérifiez que la commande `npm run dev` est bien en cours d'exécution pour générer
`dist/style.css`.
