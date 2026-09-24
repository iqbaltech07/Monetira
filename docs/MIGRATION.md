# MONETIRA — LocalStorage to PostgreSQL Migration Plan

**Phase H — Financial Data Migration Architecture**

Status: PREPARED (not yet executed)
Prerequisite: Authenticated user + Neon PostgreSQL operational

---

## Current State

All financial data lives in the user's browser localStorage.
No server-side financial data exists yet.

## localStorage Key Map

| localStorage Key | Data Type | DB Table (Target) | Status |
|---|---|---|---|
| monetira_transactions | Transaction[] | transactions | NOT MIGRATED |
| monetira_accounts | Account[] | accounts | NOT MIGRATED |
| monetira_savings | SavingsGoal[] | savings_goals | NOT MIGRATED |
| monetira_budgets | Budget[] | budgets | NOT MIGRATED |
| monetira_debts | Debt[] | debts | NOT MIGRATED |
| monetira_split_bills | SplitBill[] | split_bills | NOT MIGRATED |
| monetira_categories | Category[] | categories | NOT MIGRATED |
| monetira_subscription | Subscription | subscriptions | MIGRATED (DB) |
| monetira_ai_usage | AiUsageRecord | ai_usage | MIGRATED (DB) |
| monetira_preferences | UserPreferences | user_preferences | NOT MIGRATED |

## Migration Strategy

### Principles

1. IDEMPOTENT: Running migration twice must not duplicate data.
2. VALIDATED: All imported records are validated before insert.
3. USER-SCOPED: Data is linked to authenticated userId.
4. NON-DESTRUCTIVE: localStorage is not cleared until DB round-trip is confirmed.
5. SAFE AGAINST DUPLICATE IMPORT: Use upsert, not insert.
6. NEVER silent: Failures are surfaced to the user.

### Migration Flow

```
User logs in (Google OAuth)
↓
Session established (Auth.js + DB)
↓
Client detects: "local data exists, not yet synced"
↓
User sees migration prompt: "Sinkronkan data lokal Anda ke server?"
↓
User confirms
↓
POST /api/migrate/financial-data
  Body: {
    transactions: [...],
    accounts: [...],
    savings: [...],
    budgets: [...],
    debts: [...],
    split_bills: [...],
    categories: [...],
    preferences: {...}
  }
↓
Server:
  1. Verify Auth.js session → get userId
  2. Validate each record type against schema
  3. Insert with upsert (idempotent)
  4. Return success with counts
↓
Client:
  1. On success: mark localStorage as synced
  2. On error: keep localStorage, show error
  3. NEVER delete localStorage before server confirms
```

### Migration Execution

**Not yet implemented.** Phase H migration route will be built
after core auth + database tables are operational.

## Phase H Completion Criteria

- [ ] All 8 financial table schemas created in Prisma
- [ ] /api/migrate/financial-data route implemented
- [ ] Server-side validation for each entity type
- [ ] Upsert logic (idempotent)
- [ ] Client-side migration trigger UI
- [ ] localStorage marked as synced after successful migration
- [ ] Financial data served from DB instead of localStorage
- [ ] localStorage as fallback removed
