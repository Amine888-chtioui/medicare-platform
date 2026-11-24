# Procédures de Sauvegarde et Restauration — MediCare Platform

Ce document formalise les protocoles de sauvegarde régulière et de reprise d'activité après sinistre (PRA/DRP) pour la base de données MySQL de **MediCare Platform**.

---

## 1. Stratégie de Sauvegarde

| Type de sauvegarde | Fréquence | Destination | Rétention |
| :--- | :--- | :--- | :--- |
| **Dump SQL Complet** | Quotidienne (02:00 UTC) | Stockage local / Cloud sécurisé chiffré | 30 jours |
| **Snapshots TiDB Cloud** | Continue (automatique) | Infrastructure TiDB Cloud | 7 jours |
| **Export Pré-Déploiement** | À chaque mise à jour | Dossier horodaté dédié | 90 jours |

---

## 2. Procédure de Sauvegarde (Export)

### 2.1 Commande `mysqldump` manuelle
Exécutez la commande suivante depuis votre terminal ou serveur d'administration :

```bash
mysqldump -h <HÔTE> -P <PORT> -u <UTILISATEUR> -p \
  --single-transaction \
  --quick \
  --default-character-set=utf8mb4 \
  --triggers \
  --routines \
  --result-file="backup_medicare_$(date +%Y%m%d_%H%M%S).sql" \
  medicare_db
```

#### Explication des options :
- `--single-transaction` : Garantit une sauvegarde cohérente sans verrouiller les tables en lecture/écriture (mode InnoDB ACID).
- `--quick` : Récupère les lignes une par une sans saturer la mémoire vive du client.
- `--default-character-set=utf8mb4` : Préserve parfaitement les caractères arabes et français (accents, emojis).
- `--triggers --routines` : Sauvegarde également les éventuels déclencheurs et procédures stockées.

### 2.2 Script d'automatisation sous Linux / macOS
Créez un script `backup.sh` :
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/medicare"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/medicare_db_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump compressé à la volée
mysqldump -h "${DB_HOST:-localhost}" -u "${DB_USER:-root}" -p"${DB_PASSWORD}" \
  --single-transaction --quick --default-character-set=utf8mb4 \
  medicare_db | gzip > "$BACKUP_FILE"

# Suppression des sauvegardes de plus de 30 jours
find "$BACKUP_DIR" -type f -name "medicare_db_*.sql.gz" -mtime +30 -delete

echo "[$(date)] Sauvegarde réussie : $BACKUP_FILE"
```

Rendez-le exécutable et ajoutez-le à la `crontab` :
```bash
chmod +x backup.sh
crontab -e
# Exécution chaque nuit à 02h00 :
0 2 * * * /var/backups/medicare/backup.sh >> /var/log/medicare_backup.log 2>&1
```

### 2.3 Script d'automatisation sous Windows (PowerShell)
```powershell
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "C:\Backups\MediCare"
$OutputFile = "$BackupDir\medicare_db_$Date.sql"

if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir }

& "C:\xampp\mysql\bin\mysqldump.exe" -u root --single-transaction --quick --default-character-set=utf8mb4 medicare_db > $OutputFile

# Compression zip
Compress-Archive -Path $OutputFile -DestinationPath "$OutputFile.zip"
Remove-Item $OutputFile

Write-Host "Sauvegarde terminée : $OutputFile.zip"
```

---

## 3. Procédure de Restauration (Import)

> [!CAUTION] Risque d'écrasement
> L'importation d'une sauvegarde remplace ou modifie l'état actuel des tables. Effectuez toujours une sauvegarde de l'état présent avant toute opération de restauration.

### 3.1 Restauration depuis un fichier SQL brut
1. Créez ou assurez-vous que la base cible existe :
   ```sql
   CREATE DATABASE IF NOT EXISTS medicare_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Importez le fichier :
   ```bash
   mysql -h <HÔTE> -P <PORT> -u <UTILISATEUR> -p medicare_db < backup_medicare_XXXXXX.sql
   ```

### 3.2 Restauration depuis une archive compressée `.gz`
```bash
gunzip < backup_medicare_XXXXXX.sql.gz | mysql -h <HÔTE> -u <UTILISATEUR> -p medicare_db
```

### 3.3 Vérification post-restauration
Connectez-vous à la base et exécutez ces requêtes de contrôle :
```sql
USE medicare_db;

-- Vérifier le nombre d'enregistrements par table
SELECT 'admins' AS table_name, COUNT(*) AS total FROM admins
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'appointment_requests', COUNT(*) FROM appointment_requests
UNION ALL
SELECT 'admin_notifications', COUNT(*) FROM admin_notifications;
```

---

## 4. Sauvegarde dans le Cloud (TiDB Cloud Serverless)

Si votre application utilise **TiDB Cloud Serverless** :
1. Connectez-vous à la console TiDB Cloud.
2. Accédez à votre cluster > **Backups**.
3. TiDB Cloud effectue des sauvegardes automatiques quotidiennes conservées pendant 7 jours.
4. Pour restaurer : cliquez sur **Restore**, sélectionnez le point de restauration souhaité (Point-In-Time Recovery) et validez.
