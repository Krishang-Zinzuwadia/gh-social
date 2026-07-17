declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    GITHUB_TOKEN: string;
    BACKEND_URL: string;
    CLIENT_URL: string;
    CORS_ORIGINS?: string;
    PORT?: string;
    NODE_ENV?: string;
  }
}
