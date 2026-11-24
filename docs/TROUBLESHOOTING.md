# Guide de Résolution des Problèmes (Troubleshooting) — MediCare Platform

Ce guide rassemble les solutions aux anomalies les plus fréquemment rencontrées lors du déploiement ou de l'exécution de **MediCare Platform**.

---

## 1. Problème : Temps de réponse lent lors de la première requête (Cold Start)

### Symptôme
La première visite du site le matin ou après un moment d'inactivité prend 30 à 50 secondes pour afficher les données ou soumettre le formulaire.

### Cause
Sur le plan gratuit de **Render**, le conteneur s'endort après 15 minutes sans requête pour économiser les ressources serveur.

### Solutions
1. **Informer l'utilisateur** : Le frontend affiche un indicateur de chargement propre ("Connexion au serveur en cours...") pour éviter tout sentiment de blocage lors du réveil du conteneur.
2. **Respect des conditions d'utilisation de Render Free** : Ce comportement de mise en veille fait partie des limites normales de l'offre gratuite de test (750 heures/mois). Pour une application en production sans temps de réveil, il est recommandé de passer sur une instance payante dédiée (Starter) plutôt que d'utiliser des pings automatisés.
3. **Vérification manuelle de disponibilité** : Vous pouvez vérifier manuellement que le serveur répond via `https://medicare-api.onrender.com/api/public/health`.

---

## 2. Problème : Erreur CORS dans la console du navigateur

### Symptôme
```
Access to XMLHttpRequest at 'https://medicare-api.onrender.com/api/public/appointments' 
from origin 'https://medicare.vercel.app' has been blocked by CORS policy.
```

### Cause
Le backend n'autorise pas l'origine exacte du frontend appelant dans sa variable `CORS_ALLOWED_ORIGINS`.

### Solution
1. Rendez-vous sur le dashboard de votre hébergeur Backend (Render).
2. Vérifiez la variable d'environnement `CORS_ALLOWED_ORIGINS`.
3. Assurez-vous que l'URL exacte du frontend y figure (sans slash final) :
   ```env
   CORS_ALLOWED_ORIGINS=https://medicare.vercel.app
   ```
4. Si vous testez en local ET en production simultanément :
   ```env
   CORS_ALLOWED_ORIGINS=https://medicare.vercel.app,http://localhost:5173,http://localhost:80
   ```
5. Redémarrez le service backend pour appliquer la modification.

---

## 3. Problème : Erreur 404 lors du rafraîchissement d'une page SPA

### Symptôme
Lorsqu'on clique sur un lien du menu, la navigation fonctionne. Mais lorsqu'on appuie sur F5 ou qu'on entre directement l'URL `https://medicare.vercel.app/admin/login`, le serveur renvoie une erreur `404 Not Found`.

### Cause
Le serveur web statique cherche un fichier physique `/admin/login/index.html` qui n'existe pas dans une application monopage (SPA React).

### Solution
- **Sur Vercel** : Le fichier [`frontend/vercel.json`](../frontend/vercel.json) doit être présent à la racine du frontend et contenir la règle de redirection `rewrites`.
- **Sur Netlify / Cloudflare Pages** : Le fichier [`frontend/public/_redirects`](../frontend/public/_redirects) doit contenir `/* /index.html 200`. Il est automatiquement copié dans le dossier `dist/` lors du build.

---

## 4. Problème : Échec de connexion à la base de données (SSL / Handshake)

### Symptôme
```
Communications link failure - The last packet sent successfully to the server was 0 milliseconds ago.
SSL handshake failed: Remote host terminated the handshake.
```

### Cause
Les fournisseurs de bases de données cloud (TiDB Cloud Serverless, Clever Cloud, AWS RDS) imposent le chiffrement SSL/TLS.

### Solution
Ajoutez les paramètres SSL obligatoires dans l'URL JDBC :
```
jdbc:mysql://<HOST>:<PORT>/<DB>?useSSL=true&enabledTLSProtocols=TLSv1.2,TLSv1.3&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

---

## 5. Problème : Erreur HTTP 429 ("Trop de requêtes")

### Symptôme
L'utilisateur ou le testeur reçoit une erreur `429 Too Many Requests` avec le message "Trop de demandes soumises. Veuillez réessayer dans quelques minutes."

### Cause
Le rate limiter public protège le cabinet contre le spam en limitant à 10 demandes par IP par heure.

### Solution
1. Pour les tests intensifs, augmentez temporairement la limite via la variable d'environnement backend :
   ```env
   PUBLIC_RATE_LIMIT_MAX=50
   ```
2. Si vous êtes derrière un proxy inverse (Render, Cloudflare, Nginx), vérifiez que la variable suivante est bien activée :
   ```env
   TRUST_FORWARDED_HEADERS=true
   ```
   Sans cette variable, le rate limiter voit l'adresse IP du proxy au lieu de l'adresse IP réelle de l'utilisateur, et bloque tous les utilisateurs dès la 10ème requête globale.

---

## 6. Problème : Mot de passe administrateur refusé (HTTP 401)

### Symptôme
Connexion impossible avec l'identifiant et le mot de passe sur `/admin/login`.

### Cause
Le mot de passe dans la table `admins` n'est pas un hash BCrypt valide ou ne correspond pas au texte saisi.

### Solution
1. Ne modifiez jamais directement le mot de passe en texte clair dans phpMyAdmin ou MySQL.
2. Générez un hash BCrypt valide avec un coût de 10.
3. Exécutez l'UPDATE SQL :
   ```sql
   UPDATE admins 
   SET password = '$2a$10$NOUVEAU_HASH_BCRYPT_ICI', updated_at = NOW() 
   WHERE username = 'dr.boughaza';
   ```
