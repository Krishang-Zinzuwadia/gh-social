import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

async function main() {
  try {
    console.log("Granting permissions to Supabase roles...");
    await db.execute(
      sql`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;`,
    );
    console.log("Permissions granted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error granting permissions:", error);
    process.exit(1);
  }
}

main();
