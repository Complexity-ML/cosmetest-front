# 🧴 Cosmetest - Application de gestion des tests cosmétiques

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cosmetest est une application web moderne et complète pour la gestion professionnelle des tests cosmétiques. Elle permet de gérer efficacement les volontaires, les études, les rendez-vous et tous les aspects administratifs liés aux tests cosmétiques.

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité
- Authentification sécurisée avec JWT
- Gestion des rôles et permissions
- Protection des routes sensibles

### 📊 Tableau de bord
- Vue d'ensemble avec statistiques en temps réel
- Activités récentes et notifications
- Métriques de performance des études

### 👥 Gestion des volontaires
- Base de données complète des volontaires
- Profils détaillés avec historique médical
- Gestion des photos et documents
- Système de matching pour les études

### 🔬 Gestion des études
- Création et suivi des études cosmétiques
- Gestion des panels et groupes de test
- Critères d'inclusion/exclusion
- Suivi des résultats

### 📅 Planification des rendez-vous
- Interface calendrier intuitive
- Création de rendez-vous en lot
- Assignation automatique des volontaires
- Notifications et rappels

### 💰 Gestion des paiements
- Suivi des indemnisations
- Export des données comptables
- Historique des paiements

### 📊 Rapports et analyses
- Génération de rapports détaillés
- Export Excel des données
- Statistiques d'études
- Analyses de performance

## 🛠️ Technologies utilisées

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 18.x, Tailwind CSS, Vite |
| **Routing** | React Router DOM |
| **API** | Axios, JWT Authentication |
| **UI/UX** | Responsive Design, Modern Interface |
| **Utilitaires** | date-fns, Custom Hooks |
| **Build** | Vite, ESLint, PostCSS |

## 🚀 Installation et configuration

### Prérequis

Assurez-vous d'avoir installé :
- **Node.js** version 18.x ou supérieure
- **npm** ou **yarn**
- **Git**

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-compte/cosmetest-app.git
   cd cosmetest-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou avec yarn
   yarn install
   ```

3. **Configuration de l'environnement**
   
   Créez un fichier `.env` à la racine du projet :
   ```env
   # Configuration API
   VITE_API_URL=http://localhost:8080/api
   
   # Configuration optionnelle
   VITE_APP_NAME=Cosmetest
   VITE_APP_VERSION=1.0.0
   ```

4. **Lancer l'application**
   ```bash
   npm run dev
   # ou avec yarn
   yarn dev
   ```

5. **Accéder à l'application**
   
   Ouvrez votre navigateur à l'adresse : [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
cosmetest-app/
├── 📁 public/                    # Fichiers statiques
├── 📁 src/
│   ├── 📁 assets/               # Images, icônes, ressources
│   │   └── 📁 icons/           # Icônes SVG
│   ├── 📁 components/          # Composants React
│   │   ├── 📁 auth/            # Authentification
│   │   ├── 📁 Dashboard/       # Tableau de bord
│   │   ├── 📁 Etudes/          # Gestion des études
│   │   ├── 📁 Layout/          # Layout et navigation
│   │   ├── 📁 Paiements/       # Gestion des paiements
│   │   ├── 📁 Panel/           # Gestion des panels
│   │   ├── 📁 Parametres/      # Paramètres utilisateur
│   │   ├── 📁 Rapports/        # Rapports et analyses
│   │   ├── 📁 RendezVous/      # Gestion des RDV
│   │   ├── 📁 VolontaireHc/    # Volontaires hors centre
│   │   └── 📁 Volontaires/     # Gestion des volontaires
│   ├── 📁 context/             # Contexts React
│   ├── 📁 hooks/               # Custom hooks
│   ├── 📁 routes/              # Configuration des routes
│   ├── 📁 services/            # Services API
│   ├── 📁 types/               # Définitions TypeScript
│   └── 📁 utils/               # Utilitaires
├── 📄 .env                     # Variables d'environnement
├── 📄 package.json             # Dépendances npm
├── 📄 tailwind.config.js       # Configuration Tailwind
├── 📄 vite.config.js           # Configuration Vite
└── 📄 README.md                # Documentation
```

## 🏗️ Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance l'application en mode développement |
| `npm run build` | Construit l'application pour la production |
| `npm run preview` | Prévisualise la build de production |
| `npm run lint` | Vérifie le code avec ESLint |

## 🌐 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/` et peuvent être déployés sur n'importe quel serveur web statique.

### Déploiement recommandé

- **Netlify** : Déploiement automatique depuis Git
- **Vercel** : Intégration native avec Vite
- **AWS S3 + CloudFront** : Pour une infrastructure robuste
- **Docker** : Containerisation pour le déploiement

### Configuration du serveur web

Assurez-vous que votre serveur web redirige toutes les routes vers `index.html` pour le bon fonctionnement du routing côté client.

## ⚙️ Configuration avancée

### Proxy de développement

Le fichier `vite.config.js` est configuré pour proxifier les requêtes API :

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### Personnalisation du thème

Modifiez le fichier `tailwind.config.js` pour personnaliser l'apparence :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color'
      }
    }
  }
}
```

## 🤝 API Backend

L'application communique avec une API REST. Assurez-vous que votre backend expose les endpoints suivants :

- `/api/auth/*` - Authentification
- `/api/volontaires/*` - Gestion des volontaires
- `/api/etudes/*` - Gestion des études
- `/api/rdv/*` - Gestion des rendez-vous
- `/api/paiements/*` - Gestion des paiements

## 🐛 Dépannage

### Problèmes courants

**Problème de CORS**
```bash
# Vérifiez la configuration du proxy dans vite.config.js
# Ou configurez votre backend pour accepter les requêtes CORS
```

**Erreur de build**
```bash
# Nettoyez les dépendances et réinstallez
rm -rf node_modules package-lock.json
npm install
```

**Variables d'environnement non reconnues**
```bash
# Assurez-vous que vos variables commencent par VITE_
# Redémarrez le serveur de développement
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📞 Support

Pour toute question ou problème :

- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour la gestion moderne des tests cosmétiques**