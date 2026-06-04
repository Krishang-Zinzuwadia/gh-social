const { createClient } = require("@supabase/supabase-js");

// Supabase credentials are loaded from backend/.env.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Stop the server early if required Supabase config is missing.
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment");
}

// Shared Supabase client used by services.
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
