# My RPA Factory 🚀

**My RPA Factory** est une plateforme locale d'automatisation de processus robotisés (**RPA - Robotic Process Automation**) légère, modulaire et performante. Elle est conçue pour permettre à des utilisateurs de charger des jeux de données complexes, d'en visualiser la structure, puis d'exécuter des scripts d'automatisation de navigateur (Playwright) avec un retour visuel et des logs en temps réel.

L'idée générale est de fournir un **Studio d'automatisation local (Desktop-like/On-Premise)** ultra-léger et rapide à déployer, évitant les infrastructures lourdes tout en conservant une expérience utilisateur fluide et moderne.

---

## 📋 Table des Matières

1. [Concept Général](#-concept-général)
2. [Prérequis](#-prérequis)
3. [Installation & Démarrage](#-installation--démarrage)
4. [Architecture du Projet](#-architecture-du-projet)

---

## 💡 Concept Général

La solution repose sur trois piliers fondamentaux :
* **Ingestion de données flexible** : Chargement de fichiers sources (Excel, CSV, JSON...) contenant les lignes de tâches ou de comptes à traiter.
* **Moteur d'automatisation robuste** : Utilisation de **Playwright** pour piloter de façon fiable et rapide des navigateurs web (en mode visible pour déboguer ou invisible/headless pour la performance).
* **Feedback visuel instantané** : Streaming des logs d'exécution en temps réel via des *Server-Sent Events (SSE)* vers l'interface web locale, offrant une transparence totale sur le statut de chaque action sans rechargement de page.

---

## ⚙️ Prérequis

Avant de démarrer le projet, assurez-vous d'avoir installé les outils suivants sur votre machine :

* **[Node.js](https://nodejs.org/)** : Version **18.x** ou supérieure recommandée (inclut le gestionnaire de paquets `npm`).
* **Navigateurs pour Playwright** : Playwright nécessite des binaires de navigateurs spécifiques pour fonctionner. Ils seront installés automatiquement lors de la phase d'initialisation du projet.
* **Système d'exploitation** : Compatible Windows, macOS, et Linux.

---

## 🚀 Installation & Démarrage

Suivez ces étapes pour installer et lancer la plateforme localement :

### 1. Installation des dépendances du projet
Ouvrez votre terminal dans le dossier racine du projet et exécutez la commande suivante pour télécharger les modules Node.js requis (`express`, `multer`, `xlsx`, `playwright`, etc.) :
```bash
npm install
```

### 2. Téléchargement des navigateurs Playwright
Playwright utilise des versions optimisées de Chromium, Firefox et WebKit. Pour les installer sur votre machine locale, lancez la commande suivante :
```bash
npx playwright install
```
> *Note : Cette étape peut prendre quelques minutes selon votre connexion internet, car elle télécharge les exécutables des navigateurs requis par le moteur de script.*

### 3. Lancement de l'application
Démarrez le serveur local Express :
```bash
npm start
```
*(ou `node server.js`)*

### 4. Accès à la plateforme
Une fois le serveur démarré, ouvrez votre navigateur web préféré et accédez à l'URL suivante :
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Architecture du Projet

L'organisation des fichiers respecte une structure propre et modulaire :

```text
myRPAfactory/
├── public/              # Interface Web
│   ├── index.html       # Structure HTML
│   ├── style.css        # Styles CSS et animations (Design System)
│   └── app.js           # Logique JavaScript client (SSE, Upload, Preview)
├── uploads/             # Stockage temporaire des fichiers de données importés
├── index.js             # Moteur RPA principal (Script Playwright)
├── server.js            # Serveur d'API Express (gestion des uploads, routage, streaming SSE)
├── package.json         # Métadonnées du projet et dépendances Node.js
└── README.md            # Documentation du projet
```
