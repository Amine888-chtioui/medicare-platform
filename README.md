# MediCare Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://www.docker.com/)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-55%2F55%20Passed-success.svg)]()
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-57%2F57%20Passed-success.svg)]()

> **Plateforme web médicale bilingue (Français / Arabe)** dédiée à la présentation du cabinet médical, à la prise de rendez-vous en ligne par les patientes et à la gestion administrative sécurisée pour le médecin.

---

## Fonctionnalités Principales

### Espace Public (Patientes)
- **Site vitrine médical bilingue** : Bascule fluide Français / Arabe avec support natif du texte de droite à gauche (**RTL**).
- **Présentation du cabinet** : Médecin, spécialités, actes médicaux, équipements, horaires d'ouverture et localisation interactive.
- **Formulaire de demande de rendez-vous simplifié** : Saisie rapide (nom, téléphone marocain vérifié, motif non sensible) avec accusé de réception immédiat.
- **Protection anti-spam intégrée** : Limitation de débit par adresse IP (10 requêtes / heure max) pour prévenir les abus.
- **Accessibilité et conformité** : Design responsive adapté aux mobiles, tablettes et ordinateurs de bureau. Conforme aux recommandations de minimisation des données (Loi marocaine 09-08 / CNDP).

### Espace Administration (Médecin & Secrétariat)
- **Authentification sécurisée** : Connexion par jetons cryptographiques **JWT** (HMAC-SHA512) avec mots de passe protégés par **BCrypt** (force 10).
- **Protection anti-bruteforce** : Verrouillage temporaire après 5 tentatives de connexion erronées consécutives.
- **Tableau de bord statistique** : Indicateurs clés (demandes en attente, confirmées, annulées, total patientes, rendez-vous du jour).
- **Gestion des demandes de rendez-vous** : Filtrage par statut, recherche textuelle en temps réel, pagination serveur, modification de statut avec confirmation.
- **Planning & Calendrier** : Vue calendaire des créneaux de consultation confirmés.
- **Répertoire des patientes** : Historique des consultations associées à chaque patiente identifiée par son numéro de téléphone.
- **Centre de notifications** : Alertes visuelles instantanées à l'arrivée de toute nouvelle demande.

---

## Architecture Technique

```
medicare-platform/
├── backend/                  # API REST Spring Boot 3.3.5 (Java 21)
│   ├── src/main/java/        # Contrôleurs, Services, Entités JPA, DTOs, Sécurité JWT
│   ├── src/test/java/        # 55 tests unitaires et d'intégration (JUnit 5 + Mockito)
│   ├── Dockerfile            # Image Docker multi-stage optimisée (Alpine JRE)
│   └── pom.xml               # Configuration Maven
├── frontend/                 # Application SPA React 18 + Vite 6 (TypeScript)
│   ├── src/                  # Composants, Pages, Hooks, Services API, i18n
│   ├── public/               # Ressources statiques, favicons, règles SPA (_redirects)
│   ├── Dockerfile            # Image Docker multi-stage Nginx Alpine
│   └── package.json          # Dépendances npm & scripts
├── database/                 # Schémas et migrations SQL
│   └── schema.sql            # Schéma DDL complet pour MySQL 8.0 & TiDB Serverless
├── docs/                     # Suite documentaire complète
│   ├── INSTALLATION.md       # Guide d'installation en local (Docker & manuel)
│   ├── CONFIGURATION.md      # Dictionnaire des variables d'environnement
│   ├── DEPLOYMENT.md         # Guide de déploiement gratuit pas-à-pas
│   ├── DATABASE.md           # Architecture de données et scripts d'initialisation
│   ├── BACKUP_RESTORE.md     # Procédures de sauvegarde et reprise d'activité
│   ├── TROUBLESHOOTING.md    # Guide de résolution des pannes courantes
│   └── PROJECT_STATUS.md     # Journal d'audit et statut d'avancement
├── docker-compose.yml        # Orchestration locale (MySQL 8, Backend, Frontend)
└── README.md                 # Vue d'ensemble du projet
```

---

## Démarrage Rapide (En 2 Minutes)

Le moyen le plus simple d'exécuter la plateforme complète en local est d'utiliser **Docker Compose** :

```bash
# 1. Cloner le projet
git clone https://github.com/votre-compte/medicare-platform.git
cd medicare-platform

# 2. Copier l'environnement d'exemple
cp .env.docker.example .env

# 3. Démarrer tous les services
docker compose up -d --build
```

L'application est immédiatement accessible :
- **Site web et interface d'administration** : [http://localhost](http://localhost)
- **API Backend directe** : [http://localhost:8080](http://localhost:8080)
- **Statut de santé du système** : [http://localhost:8080/api/health](http://localhost:8080/api/health)

Pour l'installation sans Docker, consultez le [Guide d'Installation Détaillé](docs/INSTALLATION.md).

---

## Déploiement Gratuit sur Internet

Pour mettre en ligne le projet gratuitement, sans carte bancaire requise et avec une grande fiabilité :

1. **Base de données** : [TiDB Cloud Serverless](https://tidbcloud.com/) (5 Go stockage MySQL 8.0 gratuit à vie).
2. **Backend API** : [Render.com](https://render.com/) (Web Service Docker gratuit 512 Mo).
3. **Frontend SPA** : [Vercel](https://vercel.com/) ou [Cloudflare Pages](https://pages.cloudflare.com/) (Hébergement statique mondial avec SSL).

Suivez la procédure pas-à-pas dans le [Guide de Déploiement Gratuit](docs/DEPLOYMENT.md).

---

## Suite Documentaire

| Document | Contenu |
| :--- | :--- |
| [**docs/INSTALLATION.md**](docs/INSTALLATION.md) | Installation locale avec et sans Docker, prérequis, démarrage et tests. |
| [**docs/CONFIGURATION.md**](docs/CONFIGURATION.md) | Dictionnaire exhaustif de toutes les variables d'environnement (Dev & Prod). |
| [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md) | Déploiement gratuit pas-à-pas sur TiDB Cloud, Render et Vercel. |
| [**docs/DATABASE.md**](docs/DATABASE.md) | Schéma relationnel (ERD), dictionnaire des tables, index et création admin. |
| [**docs/BACKUP_RESTORE.md**](docs/BACKUP_RESTORE.md) | Scripts de sauvegarde (`mysqldump`) quotidienne, compression et restauration. |
| [**docs/TROUBLESHOOTING.md**](docs/TROUBLESHOOTING.md) | Résolution des problèmes fréquents (Cold start, CORS, SPA 404, Rate limits). |
| [**docs/PROJECT_STATUS.md**](docs/PROJECT_STATUS.md) | État du projet, historique des phases et métriques de validation. |

---

## Qualité et Sécurité

- **Tests unitaires et d'intégration** :
  - Backend : **55 tests réussis sur 55** (Contrôleurs, Services, Repositories, Sécurité JWT, Rate Limiters).
  - Frontend : **57 tests réussis sur 57** (Composants React, Modales, Formulaires, Logique métier).
- **Protection des données (Loi marocaine 09-08)** :
  - Minimisation stricte des champs demandés aux patientes.
  - Masquage des coordonnées et identifiants sensibles dans les journaux applicatifs (logs).
  - Validation rigoureuse des entrées côté client (Zod) et côté serveur (Jakarta Validation).
- **Sécurité réseau & API** :
  - En-têtes HTTP de sécurité renforcés (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
  - Validation d'origine CORS stricte.
  - Protection contre les injections SQL via requêtes préparées JPA/Hibernate.

---

## Licence & Auteurs
Projet développé dans le cadre de la plateforme médicale **MediCare Platform**.
Tous droits réservés.
