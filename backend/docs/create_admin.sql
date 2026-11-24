-- =============================================================================
-- Medicare Platform — Création sécurisée du compte Administrateur
-- =============================================================================
-- IMPORTANT : Ce script doit être exécuté UNE SEULE FOIS, par un DBA ou un
-- responsable technique, directement dans MySQL. Ne jamais exposer ce script
-- publiquement ni le versionner avec un mot de passe réel.
--
-- Pré-requis :
--   1. Générer le hash BCrypt du mot de passe AVANT d'exécuter ce script.
--      Méthode recommandée (voir ci-dessous).
--   2. Remplacer la valeur '<BCRYPT_HASH_ICI>' par le hash généré.
--   3. Remplacer '<USERNAME>' et '<EMAIL>' par les valeurs souhaitées.
-- =============================================================================

-- ── Étape 1 : Générer le hash BCrypt ─────────────────────────────────────────
--
-- Option A — Via le script Java fourni (recommandé) :
--   cd backend
--   java -cp "target/classes:$(find ~/.m2 -name 'bcrypt*.jar' | head -1)" \
--        com.medicare.platform.util.GenerateAdminHash
--   (Voir le fichier GenerateAdminHash.java fourni séparément)
--
-- Option B — Via un outil en ligne de confiance (uniquement en environnement isolé) :
--   https://www.browserling.com/tools/bcrypt  (force = 10)
--
-- Option C — Via Spring Boot Shell (si disponible dans votre projet) :
--   Lancez l'application en mode dev, appelez la méthode passwordEncoder.encode()
--   dans un test unitaire dédié.
--
-- Le hash BCrypt ressemble à : $2a$10$Xyz...ABCDEFGHIJKLMNOPQRSTUVWXYZ01234
-- =============================================================================

USE medicare_db;

-- Vérification préventive : ne pas insérer si un admin existe déjà
-- (retire le commentaire de la ligne suivante pour forcer l'insertion)
-- DELETE FROM admins WHERE username = '<USERNAME>';

INSERT INTO admins (username, email, password, created_at, updated_at)
SELECT '<USERNAME>', '<EMAIL>', '<BCRYPT_HASH_ICI>', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM admins WHERE username = '<USERNAME>'
);

-- Vérification
SELECT id, username, email, created_at
FROM admins
WHERE username = '<USERNAME>';

-- =============================================================================
-- EXEMPLE COMPLET (ne pas utiliser en production tel quel)
-- Username  : dr.boughaza
-- Email     : dr.boughaza@medicare.ma
-- Password  : MonMotDePasseFort2024!   (hash généré avec BCrypt force=10)
-- =============================================================================
/*
INSERT INTO admins (username, email, password, created_at, updated_at)
SELECT 'dr.boughaza',
       'dr.boughaza@medicare.ma',
       '$2a$10$REMPLACEZ_PAR_LE_VRAI_HASH_BCRYPT_GENERE',
       NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM admins WHERE username = 'dr.boughaza'
);
*/
