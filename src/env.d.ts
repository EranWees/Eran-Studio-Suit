// src/env.d.ts
interface ImportMetaEnv {
    VITE_GEMINI_API_KEY: string;
    // add other env variables here if needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
