declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT?: string;
    ALLOWED_ORIGINS?: string;
    LOG_LEVEL?: string;
    NODE_ENV?: string;
  }
}
