# Box

**Box** est un client de messagerie web moderne et simplifié, conçu pour offrir une expérience utilisateur fluide avec Gmail.

![Box Logo](./src/assets/Logo1_FABRICE_ADANLESSOSSI.png)

## 🚀 Fonctionnalités

- **Authentification Sécurisée** : Connexion via Google OAuth 2.0.
- **Consultation** : Accédez facilement à votre boîte de réception et vos messages envoyés.
- **Lecture** : Interface de lecture confortable et épurée.
- **Rédaction** : Envoyez des emails rapidement avec une interface simple.
- **Interface Moderne** : Design responsive, clair et intuitif.
- **Persistance** : Restez connecté même après avoir rafraîchi la page.

## 🛠️ Stack Technique

- **Frontend** : React, Vite
- **Styling** : CSS Moderne (Variables, Grid, Flexbox), Lucide React (Icônes)
- **Backend** : Node.js, Express, TypeScript (Gère l'authentification et l'API Gmail)

## 📦 Installation et Lancement

Le projet nécessite que le **Frontend** et le **Server** soient lancés simultanément.

### 1. Prérequis
- Node.js installé
- Identifiants Google OAuth (Client ID & Secret) configurés dans le serveur

### 2. Lancer le Serveur (Backend)
```bash
cd ../server
npm install
npm run dev
```
Le serveur démarrera sur `http://localhost:4001`.

### 3. Lancer l'Application (Frontend)
```bash
# Dans le dossier frontend
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:5173` (ou le port indiqué).

## 📝 Structure du Projet

- `src/App.jsx` : Composant principal gérant la logique, le routing et l'affichage.
- `src/App.css` : Styles spécifiques à la mise en page et aux composants.
- `src/index.css` : Styles globaux et variables de thème.

---
Développé avec ❤️ pour simplifier vos emails.
