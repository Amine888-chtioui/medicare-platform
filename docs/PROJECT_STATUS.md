# Medicare Platform — Project Status

> Last updated: 2026-11-21
> Maintained phase by phase. This document is the single source of truth for progress.

## 1. Project overview

Medicare Platform is a bilingual (FR/AR) web platform for Dr. Ilham Boughaza,
gynécologue-obstétricienne au Maroc.

- **Public site**: presentation, services, contact, WhatsApp, appointment request form.
- **Admin area**: JWT authentication, dashboard statistics, request list, search,
  status filter, details, status update, logout.
- **No patient account** and **no medical data collection** in the public form.

## 2. Stack actually in use

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Axios, React Hook Form, Zod, i18next |
| Backend | Java 21, Spring Boot 3.3.5, Spring Web, Spring Data JPA, Spring Security, Bean Validation, Maven |
| Database | MySQL (database `medicare_db`) |
| Auth | Stateless JWT (HS512), BCrypt password hashing, `sessionStorage` on the client |

## 3. Audit performed (initial state)

### Verified working

- MySQL `medicare_db` exists and is reachable on `localhost:3306`.
- `admins` table contains a BCrypt-hashed administrator.
- `appointment_requests` table contains real rows.
- Backend compiles, starts on port 8080 and serves real data.
- `POST /api/admin/auth/login` returns a valid JWT.
- `GET /api/admin/dashboard/stats` returns real counts from MySQL.
- `GET /api/admin/appointment-requests` returns a real paginated list.
- `GET /api/admin/appointment-requests/{id}` returns details.
- Unauthenticated admin requests return HTTP 401.
- `npm run build` succeeds (TypeScript + Vite).
- Existing backend unit test passes (`mvn test`).

### Problems found (blocking or important)

| # | Severity | Area | Problem | Status |
| --- | --- | --- | --- | --- |
| 1 | Critical | Login | `authService.login` returned `response.data` (the `ApiResponse` envelope) while the page expected `{ token }`. Login always failed despite a valid token. | To fix |
| 2 | Critical | Public form | `AppointmentForm` faked success on API error, so failed requests looked successful and were not saved. | To fix |
| 3 | High | API contract | `getById` / `updateStatus` typed as raw entities but backend returns `ApiResponse` envelopes. | To fix |
| 4 | High | Dashboard | "Évolution des demandes" chart used hard-coded fake points and a non-functional period selector. | To fix |
| 5 | High | Requests | Backend pagination existed but the UI requested 50 rows and showed no pagination controls. | To fix |
| 6 | Medium | UX | API errors were swallowed silently (empty tables, no feedback). | To fix |
| 7 | Medium | Security | No login brute-force protection; no security headers; `/error` not permitted; JWT filter could surface a 500 on a deleted user. | To fix |
| 8 | Medium | Validation | Invalid enum/filter values and malformed JSON could produce generic 500 responses. | To fix |
| 9 | Medium | Config | Default `admin/admin123` and default JWT secret usable in production without guard. | To fix |
| 10 | Medium | Privacy | Privacy policy link existed in the footer but no page/route; no consent information next to the form. | To fix |
| 11 | Medium | Placeholders | Phone, address, hours, WhatsApp and map are `[À CONFIRMER]` placeholders scattered across components. | To centralize |
| 12 | Low | Auth UX | Token expiry was not checked client-side; login page did not redirect an authenticated admin. | To fix |
| 13 | Low | Tests | Only one backend unit test; no controller/security integration tests; no frontend tests. | To fix |
| 14 | Low | Docs | No `docs/PROJECT_STATUS.md`, no installation/deployment/API documentation. | To fix |
| 15 | Low | Deployment | No production profile, Docker setup or SPA server configuration. | To fix |

### Data currently in the development database (preserved, not reset)

- 1 administrator (`admin`, BCrypt hash).
- 2 appointment requests (`EN_ATTENTE`).

> No database reset, no schema drop, no destructive migration is performed.

## 4. Phase tracking

| Phase | Scope | State |
| --- | --- | --- |
| 0 | Project setup / folders | ✅ Done |
| 1 | Architecture / base configuration | ✅ Done |
| 2 | Public site UI | ✅ Done |
| 3 | Backend domain / public API | ✅ Done |
| 4 | Admin authentication + dashboard + request management | ✅ Done |
| 5 | Frontend / backend integration | ✅ Done |
| 6 | Quality, security, performance, tests, privacy | ✅ Done |
| 7 | Deployment + documentation | ✅ Done |

## 5. Feature checklist

### Public site

| Feature | State |
| --- | --- |
| Hero / presentation | ✅ |
| Services | ✅ |
| About | ✅ |
| Contact block | ✅ (placeholders to configure) |
| WhatsApp contact | ✅ (number to configure) |
| Map | ✅ (location to configure) |
| Appointment form (name, phone, message) | ✅ UI — ❌ fake success on error |
| Bilingual FR/AR + RTL | ✅ |
| Privacy policy page | ❌ missing |

### Admin

| Feature | State |
| --- | --- |
| Secure login (BCrypt + JWT) | ✅ backend / ❌ frontend contract |
| Protected backend endpoints | ✅ |
| Protected frontend routes | 🟡 token presence only |
| Logout | ✅ client-side |
| Dashboard real stats | ✅ API / ✅ UI |
| Real 7-day chart | ❌ fake data |
| Requests list from MySQL | ✅ |
| Search by name/phone | ✅ (no debounce) |
| Filter by status | ✅ |
| Pagination | ❌ UI missing |
| Request details | ✅ (service contract mismatch) |
| Update status | ✅ |
| Loading / error states | 🟡 loading only |

## 6. Verification commands

```bash
# Backend
cd backend
mvn test
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
npm run build
```

## 7. Phase reports

### Phase de Finalisation Globale (Frontend & Backend)
- **Nettoyage et élimination du code mort** :
  - Suppression des fichiers résiduels : `err.log`, `out.log` (racine), starter templates `typescript.svg`, `vite.svg`, doublon `hero.png`.
  - Suppression des maquettes/captures obsolètes : `sidebar-full-ref.png`, doublon `sidebar-maternity-clean.png`.
  - Suppression des composants non utilisés ou à données fictives : `PlanningKpis.tsx`, `RecentRequests.tsx`, `RequestsChart.tsx`.
- **Backend Spring Boot** :
  - Suppression de la configuration dialecte H2 dépréciée dans `application-test.properties`.
  - Validation de la séparation Controller / Service / Repository / Entity / DTO et des 30 tests unitaires et d'intégration (100% succès).
  - Préservation intégrale du modèle relationnel MySQL, des données réelles et des règles métier.
- **Frontend & Design System** :
  - Harmonisation complète de la palette de couleurs (rose poudré, blanc cassé, beige et bordeaux/burgundy).
  - Intégration de l'illustration originale de la silhouette maternité dans la sidebar.
  - Rectification de l'alt text de l'image de consultation pour respecter la déontologie médicale.
  - Suppression des cartes statistiques sur la page d'Accueil (Desktop et Mobile Responsive) à la demande de l'utilisateur, préservant directement le planning hebdomadaire et les prochains rendez-vous.
  - Nettoyage du composant orphelin `StatCard.tsx`.
  - Normalisation algorithmique des couleurs d'affichage des patientes sans valeurs arbitraires codées en dur.
  - Ajout du lien direct "Demandes" avec badge de notifications dans la barre de navigation mobile inférieure de l'espace administrateur.
  - Verrouillage du débordement horizontal (`overflow-x: hidden`, `max-width: 100vw`) pour une adaptabilité parfaite sur 360px, 390px, 768px, 1024px et 1440px.
- **Résultats des tests** :
  - Backend : 30/30 tests passés avec succès (`mvn test`).
  - Frontend : 44/44 tests vitest passés avec succès.
  - Compilation de production : `npm run build` exécuté avec succès (0 erreur).

### Phase 6 : Qualité, Sécurité et Performance
- **Tests unitaires et intégration** :
  - Backend : 55 tests automatisés (100% de succès, 0 échec, 0 erreur).
    - Couverture complète des Controllers : `PublicAppointmentControllerTest`, `AdminAppointmentControllerTest`, `AdminPatientControllerTest`, `AdminNotificationControllerTest`.
    - Tests des services et rate limiters : `AppointmentServiceTest`, `PatientServiceTest`, `AdminAuthServiceTest`, `AdminNotificationServiceTest`, `LoginRateLimiterTest`, `PublicRequestRateLimiterTest`, `ClientIpResolverTest`.
    - Test d'intégration bout-en-bout : `ApiIntegrationTest`.
  - Frontend : 57 tests unitaires Vitest (8 suites de tests, 100% de succès).
    - Ajout des tests des services API : `appointmentService.test.ts`, `adminService.test.ts`.
    - Schémas de validation Zod : `schemas.test.ts` (validation nom, format téléphone marocain, dates, description).
    - Utilitaires et sécurité : `authStorage.test.ts`, `errors.test.ts`, `date.test.ts`, `useScrollLock.test.ts`, `site.test.ts`.
- **Sécurité et Confidentialité (Loi 09-08 & CNDP)** :
  - Élimination des logs de données personnelles (nom complet, numéro de téléphone) dans `PatientService`.
  - Hachage BCrypt systématique des mots de passe administrateur.
  - Protection des routes API via Spring Security stateless JWT avec vérification des expirations et révocation sur 401 côté client.
  - Protection anti-spam par adresse IP sur le formulaire public (`PublicRequestRateLimiter`) et contre la force brute sur l'authentification (`LoginRateLimiter`).
  - Validation stricte des données entrantes (formats de numéros marocains, taille des textes, créneaux horaires, dates).
  - Prévention totale des injections SQL via requêtes paramétrées Spring Data JPA.
  - Configuration CORS restrictive avec origines autorisées configurables et en-têtes sécurisés (Frame-Options DENY, No-Referrer, HSTS).
  - Gestion centralisée des exceptions sans fuite d'informations sensibles ou de stacktraces (`GlobalExceptionHandler`).
- **Optimisation des performances** :
  - Optimisation des requêtes JPA : remplacement du filtrage mémoire dans `PatientService.getAllPatients` par une requête JPQL dédiée `searchWithAppointments` avec `LEFT JOIN FETCH` pour éviter le problème N+1.
  - Optimisation du bundling frontend Vite : mise en place de `manualChunks` (`vendor-react`, `vendor-i18n`, `vendor-icons`), réduisant le bundle initial `index.js` de 386 kB à 135 kB.
  - Chargement différé (Lazy Loading) de toutes les pages React avec `React.lazy` et `Suspense`.
  - Élimination des appels redondants lors de la création d'un dossier patient côté contrôleur.
- **Vérification finale** :
  - Compilation backend (`mvn test`) : 55/55 tests validés.
  - Compilation frontend (`npm run build`) : TypeScript strict validé, build Vite réussi en 5.8s.

### Phase 7 : Déploiement Gratuit et Documentation
- **Stratégie d'hébergement gratuit (0$ - Sans carte bancaire)** :
  - Évaluation et sélection de la topologie d'hébergement 100% gratuite et pérenne :
    - Base de données : TiDB Cloud Serverless (5 Go de stockage MySQL 8.0 gratuit à vie, SSL obligatoire, haute disponibilité, aucune mise en veille).
    - Backend API : Render.com Web Service Free (512 Mo RAM, conteneur Docker Linux, port dynamique `$PORT`, mise en veille après 15 min réveillable par ping).
    - Frontend SPA : Vercel / Cloudflare Pages (CDN mondial statique illimité, SSL automatique, réécriture SPA pour React Router).
- **Conteneurisation Docker complète** :
  - `backend/Dockerfile` : Build multi-stage (Maven 3.9 + Eclipse Temurin JDK 21 Alpine -> JRE 21 Alpine allégé, utilisateur non-root `medicare`, healthcheck `/api/public/health`, gestion dynamique de la RAM conteneurisée).
  - `frontend/Dockerfile` : Build multi-stage (Node 20 Alpine -> Nginx Alpine, compression gzip, en-têtes de sécurité et fallback SPA).
  - `frontend/nginx.conf` : Configuration de production Nginx avec fallback `try_files $uri $uri/ /index.html;` et mise en cache des assets statiques.
  - `docker-compose.yml` : Orchestration locale des 3 services (`db` MySQL 8.0 avec persistance de volume et healthcheck, `backend`, `frontend`) reliés par un réseau bridge dédié `medicare-network`.
  - `.dockerignore` configuré pour le backend, le frontend et la racine.
- **Routage SPA et variables d'environnement** :
  - Ajout de `frontend/public/_redirects` pour Netlify et Cloudflare Pages.
  - Ajout de `frontend/vercel.json` pour Vercel.
  - Support de la variable `PORT` aux côtés de `SERVER_PORT` dans `application.properties` pour Render / Koyeb (`server.port=${PORT:${SERVER_PORT:8080}}`).
  - Base URL configurable sans slash final (`VITE_API_BASE_URL`).
- **Schéma relationnel officiel & Initialisation** :
  - Création de `database/schema.sql` (compatible MySQL 8.0 et TiDB Serverless, encodage `utf8mb4_unicode_ci`, tables `admins`, `patients`, `appointment_requests`, `admin_notifications` avec clés étrangères et index de performance).
  - Documentation de la création sécurisée du compte administrateur avec hachage BCrypt.
- **Suite documentaire complète produite** :
  - `README.md` : Page d'accueil professionnelle avec badges, architecture, fonctionnalités et guide de démarrage rapide.
  - `docs/INSTALLATION.md` : Guide d'installation en local (avec Docker Compose en 2 minutes ou sans Docker avec XAMPP/Java 21).
  - `docs/CONFIGURATION.md` : Dictionnaire exhaustif de toutes les variables d'environnement Backend et Frontend.
  - `docs/DEPLOYMENT.md` : Guide de mise en ligne pas-à-pas 100% gratuit (TiDB Cloud + Render + Cloudflare Pages) avec protocole de vérification mobile et PC.
  - `docs/DATABASE.md` : Schéma entité-association Mermaid, dictionnaire des tables, colonnes, index et conformité Loi 09-08 / CNDP.
  - `docs/BACKUP_RESTORE.md` : Procédures `mysqldump` quotidienne automatisée (Linux/Windows), compression gzip et restauration.
  - `docs/TROUBLESHOOTING.md` : Résolution des problèmes fréquents (Cold start, erreurs CORS, 404 SPA au rechargement, timeouts SSL, rate limiting 429).
  - `docs/PROJECT_STATUS.md` : Journal consolidé du projet.

### Audit Final Pré-Déploiement (Post Phase 7)
- **Anomalie critique corrigée — Vercel Hobby ToS** :
  - Le plan Vercel Hobby interdit explicitement l'usage commercial dans ses conditions d'utilisation. Un cabinet médical constitue un usage commercial. Vercel Hobby a été retiré des recommandations et remplacé par **Cloudflare Pages Free** (usage commercial autorisé par les ToS, DPA inclus dans les conditions self-serve, CDN mondial, SSL automatique).
- **Anomalie corrigée — Statuts erronés dans la documentation** :
  - `docs/DATABASE.md` et `docs/DEPLOYMENT.md` contenaient des valeurs de statut inexistantes (`CONFIRME`, `ANNULE`, `ARCHIVE`). Corrigées vers les valeurs réelles de l'enum Java : `EN_ATTENTE`, `CONFIRMEE`, `REFUSEE`.
- **Anomalie corrigée — Contrainte CHECK TiDB Serverless** :
  - La contrainte `CHECK (status IN ('EN_ATTENTE', 'CONFIRMEE', 'REFUSEE'))` est parsée mais **non garantie appliquée** sur TiDB Cloud Serverless car `tidb_enable_check_constraint` est `OFF` par défaut et `SET GLOBAL` requiert des privilèges `SUPER` non accordés sur la tier gratuite. La validation primaire est assurée par l'enum Java Spring Boot. Schéma et documentation mis à jour avec avertissements et procédure de test.
- **DPA — Clarification des affirmations par fournisseur** (conditions réellement vérifiées) :
  - **Cloudflare Pages Free** : DPA inclus automatiquement dans les conditions self-serve (SCCs UE, EU-US DPF). ✅ Vérifié.
  - **Render.com** : DPA disponible et signable. Certifié EU-US Data Privacy Framework. Render déconseille lui-même le Free Tier pour les applications de production traitant des données personnelles. ✅ DPA disponible, ⚠️ Free Tier non recommandé pour données réelles.
  - **TiDB Cloud (PingCAP)** : DPA disponible dans le portail legal/trust de PingCAP, applicable dès l'acceptation des CSA. Sous-traitants listés publiquement. ✅ Vérifié.
  - **Loi marocaine 09-08 / CNDP** : L'existence d'un DPA avec un fournisseur international ne remplace pas les obligations de déclaration à la CNDP ni l'analyse de licéité du transfert transfrontalier. Ces démarches restent obligatoires avant toute mise en production réelle.
- **Pings anti-veille — Limitation documentée** :
  - L'AUP de Render interdit d'abuser de l'infrastructure "pour éviter des obligations financières". Un ping 24h/24 consommerait 744h/750h disponibles. La recommandation de ping UptimeRobot a été supprimée de la documentation principale ; le comportement de cold start (~40-50s) est acceptable pour un usage diurne de cabinet médical.
- **Render Free — Statut clarifié dans DEPLOYMENT.md** :
  - Ajout d'un avertissement `[!CAUTION]` explicite indiquant que Render Free est destiné aux tests et à la validation initiale, et ne convient pas au traitement de vraies données de patientes en production.
