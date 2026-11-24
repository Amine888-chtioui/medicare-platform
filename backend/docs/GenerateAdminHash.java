// =============================================================================
// Medicare Platform — Utilitaire de génération de hash BCrypt
// =============================================================================
// Exécution (depuis le répertoire backend/) :
//
//   mvn compile exec:java -Dexec.mainClass=GenerateAdminHash \
//       -Dexec.args="MonMotDePasseFort2024!" -pl .
//
// Ou plus simplement, copier ce code dans un test JUnit temporaire :
//
//   @Test
//   void printHash() {
//       PasswordEncoder encoder = new BCryptPasswordEncoder();
//       System.out.println(encoder.encode("MonMotDePasseFort2024!"));
//   }
//
// Copiez la sortie et utilisez-la dans create_admin.sql.
// =============================================================================

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateAdminHash {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java GenerateAdminHash <mot_de_passe>");
            System.err.println("Exemple: java GenerateAdminHash MonMotDePasseFort2024!");
            System.exit(1);
        }
        String rawPassword = args[0];
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String hash = encoder.encode(rawPassword);
        System.out.println("BCrypt hash (à copier dans create_admin.sql) :");
        System.out.println(hash);
    }
}
