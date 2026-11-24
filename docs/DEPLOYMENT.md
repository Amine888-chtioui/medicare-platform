# Guide de Déploiement Gratuit — MediCare Platform

Ce guide détaille la procédure complète pour déployer **MediCare Platform** sur Internet de manière **100% gratuite**, sans carte bancaire requise et de façon durable (hors périodes d'essai éphémères).

> [!CAUTION] Ce déploiement est destiné aux tests et à la validation initiale
> L'architecture décrite dans ce document (Render Free + TiDB Cloud Starter + Cloudflare Pages) est **adaptée pour tester le site en conditions réelles** depuis un téléphone ou un ordinateur, sans frais.
>
> **Elle ne convient PAS à l'hébergement de vraies données de patientes en production**, pour les raisons suivantes :
> - Render Free indique explicitement dans sa documentation : *"Free instances have important limitations. Do not use them for production applications."* Le service peut être suspendu ou subir des interruptions sans garantie de disponibilité.
> - Ces fournisseurs ne proposent pas de Contrat de Sous-Traitance (DPA) signé individuellement ni d'hébergement certifié pour les données de santé.
> - La loi marocaine 09-08 et les obligations CNDP requièrent une analyse préalable du traitement avant tout hébergement de données personnelles de patientes.
>
> **Pour une mise en production réelle avec de vraies demandes de rendez-vous**, des options d'hébergement payantes avec garanties contractuelles seront nécessaires.

---

## 1. Vue d'ensemble de l'architecture d'hébergement

Pour respecter la gratuité sans compromis sur l'architecture (React + Spring Boot + MySQL), la plateforme est déployée selon la topologie cloud suivante :

| Composant | Fournisseur recommandé | Offre gratuite | Carte bancaire requise ? | Limites & Spécificités |
| :--- | :--- | :--- | :--- | :--- |
| **Base de données** | **TiDB Cloud Serverless** | 5 Go stockage, 50M Request Units/mois | **Non** | 100% compatible MySQL 8.0 & Spring Boot JPA. SSL natif obligatoire. Pas d'extinction. DPA disponible via CSA. |
| **Backend API** | **Render.com** (Web Service) | 512 Mo RAM, 0.1 vCPU, 750h/mois | **Non** | Support Docker / Java natif. **Pour tests uniquement** (spin-down 15 min). DPA disponible. |
| **Frontend SPA** | **Cloudflare Pages** *(recommandé)* | Illimité, SSL inclus | **Non** | Usage commercial autorisé par les ToS. DPA inclus dans les conditions self-serve. CDN mondial. |

> [!IMPORTANT] Vercel Hobby n'est pas utilisable pour ce projet
> Le plan Vercel Hobby **interdit explicitement l'usage commercial** dans ses conditions d'utilisation. Un cabinet médical recevant des demandes de rendez-vous constitue un usage commercial. Utiliser Vercel Hobby exposerait le site à une suspension sans préavis. **Cloudflare Pages Free est l'alternative recommandée** : usage commercial autorisé, DPA inclus, performances équivalentes.

### Alternatives gratuites évaluées

- **Koyeb (Backend)** : 512 Mo RAM gratuit, pas d'extinction de conteneur, mais nécessite une validation par carte bancaire (0$ facturé) pour débloquer l'accès aux nano instances selon les régions.
- **Clever Cloud (MySQL)** : Offre MySQL mutualisée gratuite (Add-on MySQL Dev), mais limitée à 10 Mo de stockage et connexions limitées.
- **Aiven (MySQL)** : Anciennement gratuit, désormais limité à une période d'essai de 30 jours (300$ de crédits).

---

## 2. Étape 1 : Déploiement de la base MySQL (TiDB Cloud Serverless)

TiDB Cloud Serverless fournit une instance MySQL 8.0 managée, sécurisée par TLS, sans carte de crédit et sans mise en veille.

1. **Création du compte** :
   - Rendez-vous sur [tidbcloud.com](https://tidbcloud.com/) et créez un compte gratuit (connexion GitHub ou Google possible).
2. **Création du cluster Serverless** :
   - Cliquez sur **Create Cluster**.
   - Choisissez l'option **Serverless** ($0/month).
   - Sélectionnez la région la plus proche (ex: `eu-central-1` Francfort ou `eu-west-1` Irlande).
   - Nommez le cluster : `medicare-db`.
3. **Récupération des identifiants de connexion** :
   - Cliquez sur **Connect**.
   - Choisissez **Connect with General Client** ou **Java**.
   - Notez les informations fournies :
     - **Host** : `gateway01.eu-central-1.prod.aws.tidbcloud.com` (exemple)
     - **Port** : `4000` (compatible MySQL)
     - **User** : `xxxx.root`
     - **Password** : Mot de passe généré lors de la création
     - **Database** : `test` (ou créez la base `medicare_db`)
4. **Initialisation du schéma** :
   - Dans la console web TiDB Cloud, ouvrez l'onglet **SQL Editor**.
   - Ouvrez et copiez le contenu du fichier local [`database/schema.sql`](../database/schema.sql).
   - Exécutez le script pour créer les tables `admins`, `patients`, `appointment_requests`, et `admin_notifications`.
5. **Création du compte Administrateur initial** :
   - Exécutez la requête d'insertion d'admin avec un hash BCrypt sécurisé (voir [`database/schema.sql`](../database/schema.sql) et [`docs/DATABASE.md`](DATABASE.md)).

---

## 3. Étape 2 : Déploiement du Backend Spring Boot (Render)

1. **Création du compte** :
   - Rendez-vous sur [render.com](https://render.com/) et connectez-vous avec votre compte GitHub.
2. **Création du Web Service** :
   - Cliquez sur **New +** > **Web Service**.
   - Sélectionnez votre dépôt GitHub `medicare-platform`.
   - Configurez les champs principaux :
     - **Name** : `medicare-api` (ou nom de votre choix)
     - **Region** : Frankfurt (EU Central)
     - **Branch** : `main`
     - **Root Directory** : laissez vide ou indiquez `backend`
     - **Runtime** : **Docker** (recommandé car utilise notre `backend/Dockerfile` multi-stage optimisé)
     - **Dockerfile Path** : `./backend/Dockerfile`
     - **Docker Context** : `./backend`
     - **Instance Type** : **Free** (512 MB)
3. **Variables d'environnement (Render Dashboard > Environment)** :
   Ajoutez les variables suivantes :

   | Clé | Valeur recommandée | Description |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Active le profil de production durci |
   | `DB_URL` | `jdbc:mysql://<HOST>:<PORT>/<DATABASE>?useSSL=true&enabledTLSProtocols=TLSv1.2,TLSv1.3&serverTimezone=UTC` | URL JDBC TiDB Cloud (avec SSL obligatoire) |
   | `DB_USERNAME` | `<USER_TIDB>` | Nom d'utilisateur TiDB |
   | `DB_PASSWORD` | `<PASSWORD_TIDB>` | Mot de passe TiDB |
   | `JWT_SECRET` | `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` | Clé secrète HS512 (générez une chaîne aléatoire d'au moins 64 caractères) |
   | `JWT_EXPIRATION_MS` | `28800000` | Durée du token (8 heures = 28800000 ms) |
   | `CORS_ALLOWED_ORIGINS` | `https://medicare-platform.vercel.app` | URL de votre frontend (à mettre à jour après l'étape 3) |
   | `TRUST_FORWARDED_HEADERS` | `true` | Indispensable pour la résolution IP correcte derrière le proxy Render |
   | `PUBLIC_RATE_LIMIT_MAX` | `10` | Limite de demandes de RDV par IP / heure |

4. **Déploiement et Test** :
   - Cliquez sur **Create Web Service**.
   - Suivez les logs de compilation et de démarrage.
   - Une fois le statut **Live**, testez le endpoint de santé dans votre navigateur :
     `https://medicare-api.onrender.com/api/public/health`
     Réponse attendue :
     ```json
     {"status":"UP","application":"MediCare Platform","version":"1.0.0"}
     ```

> [!NOTE] Comportement de mise en veille (Spin down)
> Sur le plan gratuit de Render, le conteneur s'endort après 15 minutes d'inactivité. La première requête suivante peut prendre entre 30 et 50 secondes pour réveiller le conteneur. Les requêtes suivantes répondent immédiatement (< 100 ms). Ce comportement est normal et conforme aux conditions d'utilisation de l'offre gratuite.

---

## 4. Étape 3 : Déploiement du Frontend React (Vercel / Cloudflare Pages)

### Option A : Déploiement sur Vercel (Recommandé)

1. Rendez-vous sur [vercel.com](https://vercel.com/) et connectez-vous avec GitHub.
2. Cliquez sur **Add New...** > **Project**.
3. Importez le dépôt `medicare-platform`.
4. Configurez les paramètres du projet :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `frontend` (cliquez sur Edit et sélectionnez le sous-dossier `frontend`)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. **Variables d'environnement (Environment Variables)** :
   Ajoutez :
   - `VITE_API_BASE_URL` = `https://medicare-api.onrender.com` (l'URL de votre Backend Render sans slash final)
   - Ajoutez éventuellement les coordonnées du cabinet médical si confirmées (`VITE_DOCTOR_PHONE`, `VITE_CONTACT_EMAIL`, etc.).
6. Cliquez sur **Deploy**.
7. Grâce au fichier [`frontend/vercel.json`](../frontend/vercel.json), le rafraîchissement des routes (`/admin/login`, `/rdv`, etc.) ne provoquera aucune erreur 404.

### Option B : Déploiement sur Cloudflare Pages

1. Rendez-vous sur le dashboard [Cloudflare](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Sélectionnez le dépôt `medicare-platform`.
3. Configurez :
   - **Root directory** : `/frontend`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Environment variables** : `VITE_API_BASE_URL` = `https://medicare-api.onrender.com`
4. Cliquez sur **Save and Deploy**.
5. Grâce au fichier [`frontend/public/_redirects`](../frontend/public/_redirects), toutes les routes SPA sont redirigées vers `/index.html` avec un code 200.

---

## 5. Étape 4 : Finalisation du CORS

Une fois l'URL du frontend obtenue (ex: `https://medicare-app.vercel.app`) :
1. Retournez dans le dashboard Render > service Backend > **Environment**.
2. Mettez à jour la variable `CORS_ALLOWED_ORIGINS` avec la valeur exacte du domaine Frontend :
   ```env
   CORS_ALLOWED_ORIGINS=https://medicare-app.pages.dev
   ```
3. Sauvegardez : Render redéploie automatiquement le backend pour appliquer la nouvelle restriction d'origine.

---

## 6. Conformité et protection des données (DPA)

Avant tout déploiement avec de vraies données de patientes, il est impératif de comprendre le statut contractuel de chaque fournisseur.

| Fournisseur | DPA disponible ? | Niveau de vérification | Note |
| :--- | :---: | :--- | :--- |
| **Cloudflare Pages** | ✅ Oui | Inclus automatiquement dans les conditions self-serve (auto-accept via dashboard) | Couvre les free tier users. DPA incorpore les SCCs UE. |
| **Render.com** | ✅ Oui | Disponible et signable. Render est certifié EU-US Data Privacy Framework. | La documentation Render déconseille explicitement le Free Tier pour des apps de production traitant des données personnelles. |
| **TiDB Cloud (PingCAP)** | ✅ Oui | DPA disponible dans le portail legal/trust de PingCAP, applicable dès l'acceptation des CSA. | Sous-traitants listés publiquement (AWS, GCP, Auth0, Zendesk). |

> [!IMPORTANT] Obligations légales marocaines (Loi 09-08 / CNDP)
> L'existence d'un DPA avec un fournisseur cloud européen ou américain **ne remplace pas** les obligations spécifiques au droit marocain.
>
> Avant toute mise en production réelle avec des données de patientes, les démarches suivantes sont nécessaires :
> 1. **Déclaration à la CNDP** (Commission Nationale de contrôle de la Protection des Données à caractère personnel) du traitement des données personnelles de santé.
> 2. **Analyse de la licéité du transfert transfrontalier** : les serveurs Render et TiDB Cloud sont situés aux États-Unis/Europe. Un transfert de données personnelles hors du Maroc doit être encadré.
> 3. **Validation par un conseil juridique** spécialisé en droit marocain de la santé et de la protection des données.
>
> Ces obligations s'appliquent indépendamment du fournisseur choisi et quel que soit le plan tarifaire.

---

## 7. Procédure de vérification post-déploiement

Exécutez ce protocole de test depuis un ordinateur et un smartphone connecté en 4G/5G. **Utilisez exclusivement des données fictives** (noms et numéros de téléphone inventés) pendant cette phase de test.

- [ ] **Accès public** : Charger la page d'accueil `https://votre-frontend.pages.dev`. La page s'affiche avec son identité visuelle complète.
- [ ] **Bilinguisme** : Basculer entre le Français et l'Arabe (vérifier la direction RTL).
- [ ] **Formulaire de rendez-vous (données fictives)** :
  - Soumettre une demande de test avec un nom fictif et un numéro de téléphone marocain valide (`0612345678`).
  - Vérifier l'affichage du message de confirmation instantané.
- [ ] **Anti-spam** : Soumettre 11 demandes rapides depuis la même connexion pour vérifier le déclenchement de la protection HTTP 429 ("Trop de requêtes").
- [ ] **Connexion Administrateur** :
  - Naviguer vers `/admin/login`.
  - Se connecter avec les identifiants créés lors de l'Étape 1.
  - Vérifier la redirection vers `/admin/dashboard`.
- [ ] **Gestion des demandes** :
  - Retrouver la demande de test soumise précédemment.
  - Modifier son statut (ex: `EN_ATTENTE` -> `CONFIRMEE`).
  - Rafraîchir la page pour confirmer la persistance en base TiDB.
- [ ] **Déconnexion** :
  - Cliquer sur Déconnexion.
  - Tenter d'accéder directement à `/admin/dashboard` : vérifier la redirection immédiate vers `/admin/login`.
- [ ] **Routage SPA direct** : Taper manuellement dans la barre d'adresse `https://votre-frontend.pages.dev/services` : vérifier que la page se charge correctement sans erreur 404 du serveur.
- [ ] **Test contrainte CHECK TiDB (optionnel)** : Dans la console SQL TiDB Cloud, insérer une ligne avec `status = 'VALEUR_INVALIDE'`. Si la ligne est acceptée, confirmer que la validation reste assurée au niveau applicatif (enum Java). Supprimer la ligne de test ensuite.
