# Guide de Déploiement

Ce projet est configuré pour être déployé facilement sur **Render.com**, qui supporte à la fois le backend (Node.js) et le frontend (Site Statique).

## Prérequis

1.  Un compte GitHub avec ce dépôt.
2.  Un compte sur [Render.com](https://render.com).
3.  Vos identifiants Google OAuth (Client ID et Secret) configurés dans la Google Cloud Console.

## Déploiement Automatique sur Render

Ce projet contient un fichier `render.yaml` (Blueprint) qui automatise la création des services.

1.  Allez sur le [Dashboard Render](https://dashboard.render.com/).
2.  Cliquez sur **New +** et sélectionnez **Blueprint**.
3.  Connectez votre dépôt GitHub `Box`.
4.  Donnez un nom au groupe de services (ex: `box-app`).
5.  Render détectera les deux services (`box-backend` et `box-frontend`).
6.  Il vous demandera de remplir les variables d'environnement suivantes :

### Variables pour `box-backend`

| Variable | Valeur |
|----------|--------|
| `GOOGLE_CLIENT_ID` | Votre Client ID Google |
| `GOOGLE_CLIENT_SECRET` | Votre Client Secret Google |
| `OAUTH_REDIRECT_URL` | L'URL de votre backend + `/auth/google/callback` (voir note ci-dessous) |
| `CORS_ORIGIN` | L'URL de votre frontend (voir note ci-dessous) |

### Variables pour `box-frontend`

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | Sera rempli automatiquement par Render grâce au lien entre services |

## ⚠️ Configuration Post-Déploiement Importante

Lors du premier déploiement, vous ne connaîtrez pas encore les URLs définitives de votre site. Voici comment procéder :

1.  **Premier déploiement** : Remplissez `OAUTH_REDIRECT_URL` et `CORS_ORIGIN` avec des valeurs temporaires (ex: `https://monsite.com`).
2.  **Récupérer les URLs** : Une fois le déploiement terminé (ou échoué), notez les URLs attribuées par Render :
    *   URL du Frontend (ex: `https://box-frontend-xyz.onrender.com`)
    *   URL du Backend (ex: `https://box-backend-abc.onrender.com`)
3.  **Mettre à jour Google Cloud Console** :
    *   Ajoutez l'URL du Frontend dans "Origines JavaScript autorisées".
    *   Ajoutez `https://box-backend-abc.onrender.com/auth/google/callback` dans "URI de redirection autorisés".
4.  **Mettre à jour Render** :
    *   Allez dans les paramètres de `box-backend` -> Environment.
    *   Mettez à jour `CORS_ORIGIN` avec l'URL du Frontend (`https://box-frontend-xyz.onrender.com`).
    *   Mettez à jour `OAUTH_REDIRECT_URL` avec l'URL du Backend (`https://box-backend-abc.onrender.com/auth/google/callback`).
    *   Sauvegardez, cela relancera le service.

## Déploiement Manuel (Alternative)

Si vous préférez, vous pouvez déployer chaque partie séparément sur l'hébergeur de votre choix (Vercel, Netlify, Railway...).

### Backend (Node.js)
*   **Build Command**: `npm install && npm run build`
*   **Start Command**: `npm start`
*   **Env Vars**: `PORT`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_REDIRECT_URL`.

### Frontend (React/Vite)
*   **Build Command**: `npm install && npm run build`
*   **Output Directory**: `dist`
*   **Env Vars**: `VITE_API_URL` (L'URL de votre backend).
