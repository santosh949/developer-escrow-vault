# Developer Escrow Vault - Architecture State Matrix

## Level 1: Themes
- **Core Concept:** Time-locked "Dead Man's Switch" for developer secrets.
- **Security Posture:** Zero-Knowledge Encryption (client-side AES-GCM). Only ciphertexts reach the server.
- **Aesthetic:** Hacker-Chic Dark Mode (Logic First, Paint Later).

## Level 2: Semantics
- **Stack:** Next.js (App Router), Supabase (Auth/DB/RLS), @monaco-editor/react, Web Crypto API.
- **Memory Protocol:** Hierarchical xMemory caching (Themes -> Semantics -> Episodes -> Raw).

## Level 3: Episodes (Phase 6 - Active)
- **State:** `[ACTIVE] PRODUCTION_DEPLOYMENT`
- **Dependencies Graph:**
  - `[DevOps] next.config.js` <--> `[Optimization] Code Splitting`
  - `[Config] .env.example` <--> `[Security] Zero-Knowledge Enforcement`
  - `[Hosting] Vercel` <--> `[Repository] GitHub`

## Level 4: Raw Schemas & Interfaces
- **Vault Interface:**
  ```typescript
  interface Vault {
    id: string; // UUID
    user_id: string; // UUID (matches auth.uid())
    file_name: string; // TEXT
    beneficiary_id: string | null; // UUID (references beneficiaries.id)
    countdown_days: number; // INTEGER
    encrypted_payload: string; // Base64
    iv: string; // Base64
    status: 'ACTIVE' | 'WARNING' | 'RELEASED';
    trigger_date: Date | null;
  }

  interface Beneficiary {
    id: string; // UUID
    user_id: string; // UUID
    name: string;
    email: string;
  }

  interface ApiKey {
    id: string; // UUID
    user_id: string; // UUID
    key_hash: string; // SHA-256 (Hex)
  }
  ```
