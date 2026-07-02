import { supabaseAdmin } from './backend/config/supabase.js';

async function main() {
  const email = "arushipahuja10@gmail.com";
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Found users length:", data.users.length);
    const user = data.users.find(u => u.email === email);
    console.log("User:", user?.identities);
  }
  process.exit(0);
}

main();
