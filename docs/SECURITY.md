# Monetira — Security Audit & Hardening Report

**Phase 12 — Security, Testing & Production Hardening**
Last Updated: September 2026

---

## Scope

Phase 12 audits and hardens Monetira Phases 1-11 without adding PostgreSQL, real auth, payment gateways, UI redesign, or new business features.

---

## Audit Matrix

| Area | Audited | Status |
|---|---|---|
| API routes (all) | YES | HARDENED |
| Input validation (API) | YES | PASS |
| Prompt injection guard | YES | PASS |
| XSS surface (dangerouslySetInnerHTML) | YES | HARDENED |
| Secret management / env vars | YES | PASS |
| Hardcoded credentials | YES | PASS (removed in prior sessions) |
| Subscription entitlement engine | YES | PASS |
| AI quota enforcement | YES | PASS |
| Transaction engine integrity | YES | PASS |
| localStorage trust boundary | YES | DOCUMENTED (known limitation) |
| Market API error handling | YES | PASS |
| Market API rate-limit handling | YES | PASS |
| External URL validation (stocks SSRF) | YES | PASS |
| eval() usage | YES | NONE FOUND |
| NEXT_PUBLIC_ key exposure | YES | NONE FOUND |
| .env.local in git | YES | GITIGNORED |

---

## Findings by Severity

### CRITICAL

**C-001 — stocks/route.ts: searchParams ReferenceError**

- File: src/app/api/market/stocks/route.ts, line 148
- Impact: Every GET to /api/market/stocks throws ReferenceError, breaking the stocks page permanently.
- Root Cause: searchParams was sanitized without first being extracted from the NextRequest object.
- Fix: Added const { searchParams } = new URL(request.url); inside GET handler.
- Status: FIXED

---

### HIGH

**H-001 — FinancialChat.tsx: renderMarkdown XSS via unsanitized AI content**

- File: src/components/features/assistant/FinancialChat.tsx
- Impact: renderMarkdown applied markdown-to-HTML transforms on raw AI strings before dangerouslySetInnerHTML injection. A crafted/compromised AI response could inject HTML into the DOM.
- Fix: Added escapeHtml() pre-processing (escapes <, >, &, ", ') before markdown transforms.
- Status: FIXED

---

### MEDIUM

**M-001 — gold/route.ts: Unauthenticated forex endpoint inconsistency**

- File: src/app/api/market/gold/route.ts
- Impact: Used unauthenticated v4 endpoint for USD/IDR conversion while forex/route.ts uses authenticated v6. Under rate-limiting, falls back to hardcoded 16,000 IDR/USD baseline silently.
- Fix: Reads EXCHANGERATE_API_KEY from process.env; uses v6 when key is available. Handles both conversion_rates (v6) and rates (v4) response shapes.
- Status: FIXED

---

### LOW

**L-001** — FinancialChat.tsx biome-ignore suppression: ACCEPTABLE — defense-in-depth applied via H-001.

**L-002** — billing-provider.ts reference ID pattern: DOCUMENTED — no action until real gateway integration.

---

### SAFE / NO ACTION

| Item | Finding |
|---|---|
| engine.ts balance calculation | Pure deterministic ledger. SAFE. |
| ai/chat/route.ts injection guard | sanitizeMessage() + 500-char limit. SAFE. |
| ai/parse/route.ts length guard | 500-char limit server-side. SAFE. |
| crypto/route.ts rate limit handling | Stale-cache fallback on 429. SAFE. |
| forex/route.ts missing key | Returns 503 cleanly. SAFE. |
| stocks/route.ts ticker sanitization | Alphanum+.-; 30-char limit. SAFE. |
| entitlements.ts subscription expiry | expires_at > now enforced server-side. SAFE. |
| ai-usage.ts quota check | checkAiChatAllowance before AI call. SAFE. |
| chart.tsx dangerouslySetInnerHTML | Static Recharts CSS, no user input. SAFE. |
| .env.local secrets | Gitignored. SAFE. |
| NEXT_PUBLIC_ prefix | No API keys exposed. SAFE. |

---

## Hardening Applied

### 1. Critical Fix — Stocks searchParams ReferenceError

File: src/app/api/market/stocks/route.ts

Before: searchParams referenced before extraction.
After: const { searchParams } = new URL(request.url); added as first line inside GET.

### 2. XSS Defense-in-Depth — renderMarkdown HTML Escaping

File: src/components/features/assistant/FinancialChat.tsx

Added escapeHtml() function that escapes all HTML special characters.
renderMarkdown now runs escapeHtml() first, then applies markdown transforms.
Result: AI response content cannot inject raw HTML into the DOM.

### 3. Gold Route — Authenticated Forex Endpoint

File: src/app/api/market/gold/route.ts

Now reads EXCHANGERATE_API_KEY from process.env.
Uses v6 authenticated endpoint when key is available.
Falls back to v4 unauthenticated endpoint if no key.
Handles both response shapes (conversion_rates and rates).

### 4. Environment Variable Documentation

Added GEMINI_API_KEY to .env.example. It was consumed by src/lib/ai/provider.ts but missing from the example.

### 5. Hardcoded API Keys (Removed in Prior Sessions)

- crypto/route.ts: hardcoded CoinGecko fallback key removed.
- forex/route.ts: hardcoded ExchangeRate key removed; returns 503 cleanly when absent.
- stocks/route.ts: no key required (Yahoo Finance public endpoint).

---

## Known Limitations (Deferred to Infrastructure Phase)

**KL-001 — localStorage as Untrusted Client Storage**

Financial data is stored in localStorage (plaintext, browser-isolated, user-modifiable via DevTools).
Mitigation: engine.ts derives balances deterministically — pre-computed balances from client are not trusted.
Resolution: PostgreSQL + server-side auth.

**KL-002 — Subscription State on Client**

Subscription record lives in localStorage. Server reads it from request body (client-reported), not DB.
Risk: User can modify localStorage to claim PRO. Impact is limited to extra AI queries — no ledger mutation possible.
Resolution: OAuth + DB session will eliminate client-reporting.

**KL-003 — No CSRF Protection**

Not needed without auth cookies. When OAuth sessions are introduced, implement SameSite cookies and CSRF tokens.

**KL-004 — No Server-Side Rate Limiting on /api/ai/chat**

Client-reported quota only. Implement Upstash Redis rate limiting once infrastructure is available.

---

## Secret Management

| Variable | Used In | Required | Gitignored |
|---|---|---|---|
| GEMINI_API_KEY | src/lib/ai/provider.ts | Optional (degrades gracefully) | YES |
| COINGECKO_API_KEY | src/app/api/market/crypto/route.ts | Optional (rate-limited without key) | YES |
| EXCHANGERATE_API_KEY | src/app/api/market/forex/route.ts, gold/route.ts | Optional (forex returns 503 without key) | YES |

Rules:
- No NEXT_PUBLIC_ prefixed secrets (audited and confirmed).
- .env.local excluded via .gitignore (.env* with !.env.example exception).
- No hardcoded fallback API keys in codebase.

---

## XSS and Injection Surface Map

| Surface | Type | Input Source | Mitigation |
|---|---|---|---|
| FinancialChat.tsx dangerouslySetInnerHTML | DOM injection | AI model response | escapeHtml() pre-processing + markdown-only transforms |
| chart.tsx dangerouslySetInnerHTML | CSS injection | Static Recharts styles | Static string, no user input |
| /api/ai/chat message field | Prompt injection | User text | sanitizeMessage() regex + 500-char limit |
| /api/ai/parse text field | Prompt injection | User text | 500-char limit; deterministic parser |
| /api/market/stocks q param | SSRF / URL injection | URL query param | Alphanum sanitization + 30-char + encodeURIComponent |
| localStorage reads | Data tampering | User's own browser | Ledger re-derived deterministically; AI is read-only |

---

## Subscription Security

| Check | Implementation | Location |
|---|---|---|
| Entitlement matrix | PLAN_CAPABILITIES record | lib/subscription/entitlements.ts |
| Time-based expiry | isSubscriptionActive() — expires_at > now | lib/subscription/entitlements.ts |
| Effective plan resolution | getEffectivePlan() defaults to FREE on invalid state | lib/subscription/entitlements.ts |
| AI quota enforcement | checkAiChatAllowance() server-side before AI call | /api/ai/chat/route.ts |
| Quota response | HTTP 429 with reason message | /api/ai/chat/route.ts |
| Payment gateway | DeferredBillingProvider — no fake checkout | lib/subscription/billing-provider.ts |

---

## API Security

| Route | Method | Auth Guard | Input Validation | Rate Guard | Error Handling |
|---|---|---|---|---|---|
| /api/ai/chat | POST | Subscription check | message (string, max 500), context (shape check) | Client quota | 400 / 429 / 503 |
| /api/ai/parse | POST | None | text (string, max 500) | None | 400 / 500 |
| /api/market/crypto | GET | None | None | 60s in-memory cache | Stale cache fallback |
| /api/market/forex | GET | None | None | 30min in-memory cache | 503 on missing key |
| /api/market/gold | GET | None | None | 60s in-memory cache | Stale cache fallback |
| /api/market/stocks | GET | None | q sanitized (alphanum+.-) | 60s in-memory cache | Stale cache fallback |

---

## Data Privacy

- Financial data: stored exclusively in localStorage. Never transmitted to any Monetira backend.
- AI queries: FinancialContext (aggregated metrics, no PII beyond amounts) transmitted to /api/ai/chat then Gemini API.
- Market data: read-only, no user data transmitted to market providers.

---

## Post-Phase-12 Roadmap

| Item | Reason Deferred |
|---|---|
| Google OAuth authentication | Requires server-side session infrastructure |
| PostgreSQL / Neon database | Requires auth + deployment infrastructure |
| Server-side subscription verification | Blocked on auth + database |
| Real payment gateway (Midtrans/Xendit) | Blocked on auth + database |
| IP-based rate limiting | Requires infrastructure (Upstash/Redis) |
| CSRF tokens | Blocked on session cookies (auth) |
| Encryption at rest | Blocked on server-side storage |
| Cross-device sync | Blocked on database |
| Audit log / event sourcing | Blocked on database |
