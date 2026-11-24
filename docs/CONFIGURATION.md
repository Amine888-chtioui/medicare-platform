# Dictionnaire des Variables de Configuration — MediCare Platform

Ce document répertorie exhaustivement toutes les variables d'environnement prises en charge par les composants Backend (Spring Boot) et Frontend (React Vite) de **MediCare Platform**.

---

## 1. Variables Backend (Spring Boot)

Toutes les variables sont injectées via le système d'environnement de l'hôte (ou du conteneur Docker).

| Variable | Obligatoire en Prod ? | Valeur par défaut | Description & Recommandation |
| :--- | :---: | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Oui | `default` | Activer `prod` en production pour désactiver la modification DDL automatique (`ddl-auto=validate`) et masquer les détails d'erreurs. |
| `PORT` ou `SERVER_PORT` | Non | `8080` | Port d'écoute du serveur HTTP Tomcat embarqué. Render injecte automatiquement `PORT`. |
| `DB_URL` | **Oui** | `jdbc:mysql://localhost:3306/medicare_db?...` | URL JDBC de connexion à MySQL. En production avec TiDB ou MySQL Cloud, forcer `useSSL=true&enabledTLSProtocols=TLSv1.2,TLSv1.3`. |
| `DB_USERNAME` | **Oui** | `root` | Nom d'utilisateur de la base de données. |
| `DB_PASSWORD` | **Oui** | *(vide)* | Mot de passe associé à l'utilisateur de base de données. |
| `DB_POOL_SIZE` | Non | `10` | Nombre maximum de connexions actives dans le pool HikariCP. Réduire à `5` sur les petits conteneurs (512 Mo). |
| `DB_POOL_MIN_IDLE` | Non | `2` | Nombre minimum de connexions dormantes maintenues par HikariCP. |
| `JPA_DDL_AUTO` | Non | `update` (dev) / `validate` (prod) | Stratégie Hibernate DDL. En production, TOUJOURS utiliser `validate` pour préserver l'intégrité des tables. |
| `JWT_SECRET` | **Oui** | *(clé dev 64 car)* | Clé cryptographique pour la signature des jetons HMAC-SHA512. **Doit impérativement être modifiée en production**. Si le profil `prod` détecte la clé par défaut, le serveur refuse de démarrer (`IllegalStateException`). |
| `JWT_EXPIRATION_MS` | Non | `28800000` (8h) | Durée de validité des tokens JWT en millisecondes. 8 heures recommandées pour le personnel de cabinet. |
| `CORS_ALLOWED_ORIGINS` | **Oui** | `http://localhost:5173,...` | Liste séparée par des virgules des origines web autorisées à interroger l'API. En production, mettre uniquement l'URL exacte du Frontend (ex: `https://medicare.vercel.app`). |
| `TRUST_FORWARDED_HEADERS` | Conditionnel | `false` | Activer (`true`) uniquement si le backend est situé derrière un proxy inverse de confiance (Nginx, Traefik, Cloudflare, Render). Permet la résolution correcte de l'IP cliente pour le rate limiting. |
| `PUBLIC_RATE_LIMIT_MAX` | Non | `10` | Nombre maximal de soumissions de demandes de RDV autorisées par adresse IP dans la fenêtre de temps. |
| `PUBLIC_RATE_LIMIT_WINDOW_MINUTES` | Non | `60` | Fenêtre temporelle du rate limiter public en minutes (défaut : 60 min). |

---

## 2. Variables Frontend (React / Vite)

Les variables frontend doivent être préfixées par `VITE_` pour être prises en compte par Vite au moment du build (`npm run build`).

| Variable | Obligatoire en Prod ? | Valeur par défaut | Description & Recommandation |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Oui** (si domaines distincts) | `http://localhost:8080` | URL absolue du Backend Spring Boot (sans slash final). Exemple : `https://medicare-api.onrender.com`. Si vide, utilise la même origine (`/api/...`). |
| `VITE_CLINIC_NAME` | Non | *(vide)* | Nom officiel du cabinet ou de la clinique affiché dans l'en-tête et le pied de page. |
| `VITE_DOCTOR_PHONE` | Non | *(vide)* | Numéro de téléphone d'appel direct (ex: `+212 5 22 00 00 00`). Masqué si vide. |
| `VITE_WHATSAPP_NUMBER` | Non | *(vide)* | Numéro WhatsApp professionnel au format international sans `+` ni espaces (ex: `212600000000`). |
| `VITE_CONTACT_EMAIL` | Non | *(vide)* | Adresse e-mail de contact public du cabinet. |
| `VITE_CLINIC_ADDRESS` | Non | *(vide)* | Adresse physique du cabinet. |
| `VITE_CLINIC_CITY` | Non | *(vide)* | Ville du cabinet (ex: Casablanca, Rabat). |
| `VITE_HOURS_WEEK` | Non | *(vide)* | Horaires d'ouverture en semaine (ex: `Lun - Ven : 09:00 - 18:00`). |
| `VITE_HOURS_SATURDAY` | Non | *(vide)* | Horaires d'ouverture le samedi (ex: `Sam : 09:00 - 13:00`). |
| `VITE_MAP_EMBED_URL` | Non | *(vide)* | URL source `<iframe>` pour la carte Google Maps interactive. |
| `VITE_MAP_LINK_URL` | Non | *(vide)* | Lien externe vers l'application Google Maps ("Ouvrir l'itinéraire"). |
| `VITE_SOCIAL_FACEBOOK` | Non | *(vide)* | URL de la page Facebook professionnelle. |
| `VITE_SOCIAL_INSTAGRAM` | Non | *(vide)* | URL du profil Instagram professionnel. |

---

## 3. Bonnes pratiques de sécurité relatives aux secrets

1. **Aucun secret dans le code source** : Ne committez jamais de fichier `.env`, `.env.local` ou de mots de passe réels dans les dépôts Git.
2. **Rotation des clés JWT** : Si la clé `JWT_SECRET` est compromise, générez-en une nouvelle immédiatement dans le panneau de l'hébergeur. Cela invalidera immédiatement toutes les sessions actives.
3. **Génération d'un secret JWT robuste** :
   ```bash
   # Génération d'une clé aléatoire de 256 bits en hexadécimal (64 caractères) :
   openssl rand -hex 32
   ```
