# Guide d'Installation Locale — MediCare Platform

Ce guide détaille les étapes pour installer, configurer et exécuter **MediCare Platform** sur une machine locale de développement.

Deux méthodes sont disponibles :
1. **Méthode 1 (Recommandée) : Avec Docker & Docker Compose** (Zéro installation de Java/MySQL requise).
2. **Méthode 2 : Sans Docker** (Développement classique avec Java 21, Node.js 20 et MySQL/XAMPP).

---

## Prérequis généraux

| Composant | Version minimale requise | Comment vérifier ? |
| :--- | :--- | :--- |
| **Git** | 2.30+ | `git --version` |
| **Docker** (Méthode 1) | Docker Desktop 24+ avec Docker Compose v2 | `docker compose version` |
| **Java JDK** (Méthode 2) | Eclipse Temurin ou OpenJDK **21** (LTS) | `java -version` |
| **Maven** (Méthode 2) | 3.8+ (un Maven embarqué est fourni dans le dépôt) | `.\maven\apache-maven-3.9.6\bin\mvn -v` |
| **Node.js** (Méthode 2) | Node.js 20 LTS (inclut npm 10+) | `node -v` et `npm -v` |
| **MySQL** (Méthode 2) | MySQL 8.0+ ou MariaDB 10.5+ (XAMPP) | `mysql --version` |

---

## Méthode 1 : Installation avec Docker Compose

Cette méthode lance l'ensemble de la pile technique (Base MySQL 8.0, API Spring Boot et Frontend Vite/Nginx) dans des conteneurs isolés et reproductibles.

### 1. Cloner le projet
```bash
git clone https://github.com/votre-compte/medicare-platform.git
cd medicare-platform
```

### 2. Configurer les variables d'environnement Docker
Copiez le fichier d'exemple et personnalisez si besoin :
```bash
cp .env.docker.example .env
```
Le fichier `.env` configure automatiquement les mots de passe de la base de données et la clé JWT pour vos conteneurs.

### 3. Démarrer les conteneurs
```bash
docker compose up -d --build
```

### 4. Vérifier l'état des conteneurs
```bash
docker compose ps
```
Tous les conteneurs (`medicare-mysql`, `medicare-backend`, `medicare-frontend`) doivent afficher le statut `healthy` ou `Up`.

### 5. Accéder à l'application
- **Site public & Dashboard Admin** : [http://localhost](http://localhost) (Port 80)
- **API Backend directe** : [http://localhost:8080](http://localhost:8080)
- **Endpoint de santé** : [http://localhost:8080/api/public/health](http://localhost:8080/api/public/health)
- **Base de données MySQL** : `localhost:3306` (User: `medicare_user`, Password: `medicare_pass_2026`)

### 6. Arrêter les conteneurs
```bash
docker compose down
# Ou pour effacer également les données persistées :
docker compose down -v
```

---

## Méthode 2 : Installation manuelle (Sans Docker)

### 1. Configuration de la base de données MySQL

1. Démarrez votre serveur MySQL (par exemple via le panneau de contrôle **XAMPP** en activant le module MySQL).
2. Connectez-vous à MySQL en ligne de commande ou via phpMyAdmin :
   ```bash
   mysql -u root -p
   ```
3. Exécutez le script d'initialisation du schéma :
   ```bash
   mysql -u root -p < database/schema.sql
   ```
4. Exécutez le script de création de compte administrateur :
   ```bash
   mysql -u root -p < backend/docs/create_admin.sql
   ```

### 2. Démarrage du Backend (Spring Boot)

1. Ouvrez un terminal dans le répertoire `backend` :
   ```bash
   cd backend
   ```
2. Configurez les variables d'environnement pour votre session (PowerShell) :
   ```powershell
   $env:DB_URL="jdbc:mysql://localhost:3306/medicare_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
   $env:DB_USERNAME="root"
   $env:DB_PASSWORD=""
   $env:JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
   $env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
   ```
   *(Ou sous Bash/Linux)* :
   ```bash
   export DB_URL="jdbc:mysql://localhost:3306/medicare_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
   export DB_USERNAME="root"
   export DB_PASSWORD=""
   export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
   export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
   ```
3. Compilez et lancez l'application :
   ```bash
   # Avec le Maven wrapper ou Maven installé :
   mvn spring-boot:run
   
   # Ou avec le binaire Maven embarqué sur Windows :
   ..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
   ```
4. Vérifiez que la console affiche :
   ```
   Started MedicarePlatformApplication in X.XXX seconds
   ```
   Testez dans votre navigateur : [http://localhost:8080/api/public/health](http://localhost:8080/api/public/health)

### 3. Démarrage du Frontend (React / Vite)

1. Ouvrez un second terminal dans le répertoire `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances npm :
   ```bash
   npm install
   ```
3. Créez un fichier `.env.local` si vous souhaitez surcharger l'URL de l'API :
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Lancez le serveur de développement Vite :
   ```bash
   npm run dev
   ```
5. Ouvrez le navigateur à l'adresse indiquée : [http://localhost:5173](http://localhost:5173)

---

## Exécution des suites de tests

### Tests Backend (JUnit 5 + Spring Boot Test)
```bash
cd backend
mvn test
# Ou Windows :
..\maven\apache-maven-3.9.6\bin\mvn.cmd test
```
*Résultat attendu : 55 tests exécutés, 0 échec, 0 erreur.*

### Tests Frontend (Vitest + Testing Library)
```bash
cd frontend
npm test
```
*Résultat attendu : 8 suites de tests, 57 tests passés avec succès.*
