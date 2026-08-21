# Backend Audit Report — Fusion-Baukasten
> Generated: 2026-08-21 | Analyst: Antigravity

---

## 1. DATABASE SCHEMA ANALYSIS

### 1.1 Role System — Two Conflicting Role Systems ⚠️

| Layer | Model | Field | Values |
|---|---|---|---|
| Platform | `User` | `system_role` | `project_manager`, `team_member`, `client` |
| Organization | `Membership` | `org_role` | `owner`, `editor`, `viewer` (string, no enum!) |
| Project | `TeamMember` | `team_role` | `Owner`, `Editor`, `Viewer` (enum) |
| Invitation | `Invitation` | `role` | `"project_manager"`, `"member"`, `"viewer"` (freeform string!) |

**Problem:** Three separate, inconsistent role systems exist simultaneously.
- `Membership.org_role` is a plain `String` with no enum — any value can be stored.
- `Invitation.role` default is `"member"` but `system_role` uses `"team_member"`. When a PM invites with role `"team_member"`, it maps correctly. But the role stored in `Invitation.role` is freeform and disconnected.
- `TeamRole` enum in domain2 uses capitalized values (`"Owner"`, `"Editor"`) while `org_role` strings are lowercase.

**Fix:** Consolidate. Remove `Membership.org_role` string and use the existing `SystemRole` enum throughout. Add an index on `Membership.org_id` for performance.

---

### 1.2 Missing Cascade Deletes — Orphan Records Risk 🔴

| Parent | Child | Missing Cascade |
|---|---|---|
| `User` (deleted) | `Membership` rows | ❌ No cascade |
| `User` (deleted) | `Invitation` rows | ❌ No cascade |
| `User` (deleted) | `SavedTargetAudience` | ❌ No cascade |
| `User` (deleted) | `Notification` | ❌ No cascade |
| `Organization` (deleted) | `Membership` rows | ❌ No cascade |
| `Organization` (deleted) | `Invitation` rows | ❌ No cascade |
| `Project` (deleted) | `ActivityLog` | ❌ No cascade |
| `Project` (deleted) | `ProjectSnapshot` | ❌ No cascade |

`Project → TeamMember` is the **only** cascade defined (`cascade="all, delete-orphan"`). Everything else will leave orphaned rows.

**Fix:** Add `cascade="all, delete-orphan"` on all child relationships, or at minimum add `ondelete="CASCADE"` at the database column level.

---

### 1.3 Nullable Fields That Should Be Required

| Model | Field | Issue |
|---|---|---|
| `User.first_name` | `Column(String)` | Nullable — display name becomes `"None None"` |
| `User.last_name` | `Column(String)` | Nullable — same issue |
| `User.system_role` | `Column(Enum, nullable=True)` | A user without a role can log in but gets no dashboard |
| `User.hashed_password` | `nullable=True` | Correct for SSO users, but regular users could theoretically have null password stored |
| `Project.updated_at` | `onupdate=func.now()` | Never set on initial insert — will be `NULL` until first edit |
| `TeamMember.team_role` | defaults to `viewer` | Fine, but inconsistent with `system_role` which has no default |

---

### 1.4 Missing Database Indexes

| Table | Column | Query frequency | Missing index |
|---|---|---|---|
| `memberships` | `org_id` | Very high — every team list query | ❌ |
| `invitations` | `org_id` | High | ❌ |
| `tasks` | `owner_id` | Very high — dashboard loads | ❌ |
| `tasks` | `project_id` | Very high | ❌ |
| `team_members` | `project_id` | High | ❌ |
| `activity_logs` | `project_id` | High | ❌ |
| `project_snapshots` | `project_id` | Medium | ❌ |

Only `User.email`, `Invitation.email`, and `Invitation.token` have indexes. The rest are missing.

---

### 1.5 `Team` Model Is Completely Unused 🔴

The `Team` model (`domain1_stammdaten.py`, line 84) is defined, has a relationship to `Organization`, but:
- No API endpoint creates or reads `Team` records
- `TeamMember` in domain2 references a `Project`, not a `Team`
- No foreign key exists between `Team` and `TeamMember`

The `Team` table is dead weight — its intended purpose is duplicated (poorly) by `TeamMember`.

---

### 1.6 `ProjectSnapshot`, `SavedTargetAudience`, `ProjectTemplate` Have Zero API Coverage

These three models are defined in domain2 with no corresponding API endpoints. They represent core features (versioning, reusable templates) that are described in the business logic doc but entirely unimplemented at the API layer.

---

## 2. BUSINESS LOGIC CONSISTENCY

### 2.1 Invitation Flow Logic Gap 🔴

**The flow is:**
1. PM invites email → `Invitation` record created with `org_id` from PM's `Membership`
2. Invitee clicks link → `/invitations/verify/{token}` returns `email`, `org_name`, `role`
3. Invitee registers → `/auth/register` with `invite_token`
4. Register endpoint marks invitation `accepted` and creates a `Membership`

**The gap:** The `Invitation.role` field stores `"team_member"` but the `Membership` created on acceptance uses `org_role="member"` (hardcoded, line 221 in `auth.py`). The invited role is **ignored** when creating the Membership. A PM who invited someone as `"project_manager"` would create a `Membership` with `org_role="member"`.

Also, the newly registered user's `system_role` comes from the **request body** (`user_in.system_role`), not from the invitation. A bad actor could tamper with the POST body and register as `project_manager` using someone else's `team_member` invitation token.

**Fix:** When `invite_token` is present, the `system_role` must be taken from the `Invitation.role` record in the database, not the request body.

---

### 2.2 `datetime.utcnow()` Used in Invitation Creation (Still Present!) ⚠️

`invitations.py` line 40: `expires_at=datetime.utcnow() + timedelta(days=7)` — this still uses the naive UTC datetime. The **verify** endpoint was fixed (using `datetime.now(timezone.utc)`), but the **creation** side still creates a naive datetime. This means the comparison will still fail for new invitations created after the fix.

**Fix:** Change line 40 to `datetime.now(timezone.utc) + timedelta(days=7)`.

---

### 2.3 Guest User Security Gap 🔴

`/auth/convert-guest` accepts a `session_id` from the client body and merges all projects with that `guest_session_id` to the new user. There is **no verification** that the session_id belongs to the requesting device. Anyone who knows another user's `guest_session_id` (from URL, local storage, etc.) can steal their guest projects.

**Fix:** The guest session must be verified via a signed cookie or server-side session store, not a client-submitted string.

---

## 3. API SECURITY AUDIT

### 3.1 IDOR Vulnerability in Dashboard Endpoints 🔴

`GET /api/v1/dashboard/projects` checks `Project.owner_id == current_user.id` ✅

BUT: `GET /api/v1/dashboard/tasks` fetches tasks by `Task.owner_id == current_user.id` ✅

However, there are **no project-level or task-level API endpoints** (`/projects/{id}`, `/tasks/{id}`) visible in the codebase for the frontend to use directly. If such endpoints exist and are not shown, they must verify ownership. If they don't exist yet, IDOR is a future risk.

### 3.2 Role Check Is String-Based, Not Enum-Based ⚠️

`invitations.py` line 22:
```python
if "project_manager" not in str(current_user.system_role):
```
This is a fragile substring check. If the enum ever changes (e.g., `SystemRole.senior_project_manager`), this silently breaks. Should be:
```python
if current_user.system_role != SystemRole.project_manager:
```

### 3.3 `get_current_user` Returns `None` Instead of Raising 401 🔴

`deps.py` line 28: `if not token: return None`

This means any endpoint that uses `Depends(deps.get_current_user)` and doesn't explicitly check for `None` will crash with an `AttributeError` (e.g., `None.system_role`) instead of a clean 401 Unauthorized.

The `/dashboard/stats` endpoint would crash at `current_user.system_role` if called without a token, returning a 500 instead of a 401.

**Fix:** Raise `HTTPException(401)` if no token — or create a separate `get_current_user_optional` for endpoints that support anonymous access.

### 3.4 JWT Token Reuse for Multiple Purposes 🔴

The **same** `create_access_token()` function and **same** secret key is used for:
- Session tokens (login)
- Email verification tokens
- Password reset tokens

A password reset token is technically a valid session token and vice versa. An attacker who intercepts a password reset email could use that JWT to call `/auth/session` as the user.

**Fix:** Add a `"type": "reset"` or `"type": "verify"` claim to the JWT payload and validate it in the respective endpoints.

### 3.5 Password Reset Does Not Invalidate Old Tokens ⚠️

After a user resets their password, any previously issued reset tokens (and their session tokens) remain valid. There is no token blacklist or `token_version` column.

### 3.6 `DEBUG print()` Statements in Production Code 🔴

Multiple `print()` statements expose internal data:
- `auth.py` line 421: `print(f"DEBUG MICROSOFT JWT PAYLOAD: {payload}")` — dumps the entire Microsoft JWT payload to server logs
- `auth.py` line 424: `print(f"Token validation error: {str(e)}")`
- `invitations.py` line 66: `print(f"DEBUG: Resend API key missing...")`

These should be replaced with a proper Python `logging` module at `DEBUG` level.

### 3.7 Microsoft JWKS Keys Are Cached Forever in Memory ⚠️

`auth.py` lines 375–386: `_ms_keys` is a module-level global that is fetched once and never refreshed. Microsoft rotates its JWKS keys periodically. When keys rotate, all SSO logins will fail with 500 errors until the server restarts.

**Fix:** Add a TTL (e.g., 24-hour cache) or refresh on `kid` mismatch.

### 3.8 CORS Configuration — Need to Verify ⚠️

`main.py` not fully read but the frontend calls `http://localhost:8000` — the CORS `allow_origins` list must be restrictive in production. Wildcard `*` would be a critical security issue.

---

## 4. API DESIGN & STANDARD PRACTICES

### 4.1 HTTP Method Violations

| Endpoint | Current Method | Correct Method | Issue |
|---|---|---|---|
| `/auth/verify-email` | `POST` with query param `token` | `GET /auth/verify-email?token=` | Verification links in emails are GET requests |
| `/auth/logout` | `POST` | `POST` ✅ | Correct |
| `/invitations/` (create) | `POST` | `POST` ✅ | Correct |

### 4.2 Incorrect Status Codes

| Endpoint | Current Code | Correct Code | Issue |
|---|---|---|---|
| `POST /auth/login` (bad credentials) | `400` | `401` | Wrong — 400 is bad request, 401 is unauthorized |
| `POST /auth/register` (email exists) | `400` | `409 Conflict` | Duplicate resource should be 409 |
| `POST /auth/sso` (new user detected) | `200` | `200` ✅ | Acceptable but `is_new_user: true` flag is a design smell |

### 4.3 N+1 Query Problem in `/invitations/team` 🔴

`invitations.py` lines 107–121: For each `Membership`, it issues a separate `db.query(User)`:
```python
for m in memberships:
    u = db.query(User).filter(User.id == m.user_id).first()  # N queries!
```
If there are 50 team members, this is 50+1 database queries. Should use a JOIN or `selectinload()`.

**Fix:**
```python
from sqlalchemy.orm import joinedload
memberships = db.query(Membership).options(joinedload(Membership.user)).filter(...).all()
```

### 4.4 No Pagination on Any List Endpoint

`/dashboard/projects`, `/dashboard/activity`, `/invitations/team` — none have pagination. With 100+ projects or 1000+ activity log entries, these will time out or return enormous payloads.

### 4.5 Inconsistent Error Response Format

Some endpoints return `{"detail": "..."}` (FastAPI default), others return `{"message": "..."}`, others return `{"msg": "..."}`. There is no consistent error schema. Frontends must handle all three patterns.

---

## 5. CRITICAL MISSING FEATURES

| Feature | Defined in Models | API Endpoint | Status |
|---|---|---|---|
| Project CRUD | ✅ `Project` model | ❌ No `/projects` endpoint visible | **Missing** |
| Task CRUD | ✅ `Task` model | Partially (dashboard reads only) | **Partial** |
| Milestone CRUD | ✅ `Milestone` model | Dashboard read only | **Partial** |
| Project Snapshots | ✅ Model | ❌ | **Missing** |
| Notification system | ✅ `Notification` model | ❌ No endpoint | **Missing** |
| Communication/Messages | ✅ Full models | ❌ No endpoint | **Missing** |
| Team removal | ❌ | ❌ | **Missing** |
| Budget CRUD | `Project.budget_total/used` columns | ❌ No input endpoint | **Missing** |

---

## 6. PRIORITY FIXES

### 🔴 CRITICAL

| # | Issue | Fix |
|---|---|---|
| C1 | `get_current_user` returns `None` — causes 500s instead of 401s | Raise `HTTPException(401)` on missing token |
| C2 | Invitation role not enforced on registration — role can be tampered | Use `invitation.role` from DB, not request body |
| C3 | Same JWT used for sessions, verification, and password resets | Add `type` claim to JWT payloads |
| C4 | Guest session merge has no ownership verification | Verify via signed server-side cookie |
| C5 | `datetime.utcnow()` in invitation creation still creates naive datetimes | Replace with `datetime.now(timezone.utc)` |

### 🟠 HIGH

| # | Issue | Fix |
|---|---|---|
| H1 | N+1 query in `/invitations/team` | Use `joinedload()` |
| H2 | Role check is substring, not enum comparison | Use `!= SystemRole.project_manager` |
| H3 | No cascade deletes — orphan records accumulate | Add `cascade="all, delete-orphan"` |
| H4 | Missing DB indexes on high-traffic columns | Add indexes on `tasks.owner_id`, `memberships.org_id`, etc. |
| H5 | `DEBUG print()` statements leak JWT payload to logs | Replace with `logging.debug()` |
| H6 | JWKS cache never refreshes — SSO will break after key rotation | Add 24h TTL cache |

### 🟡 MEDIUM

| # | Issue | Fix |
|---|---|---|
| M1 | `User.first_name/last_name` nullable — breaks display names | Add `nullable=False` with migration |
| M2 | Three inconsistent role systems | Consolidate to one `SystemRole` enum |
| M3 | HTTP 400 on bad login instead of 401 | Return 401 Unauthorized |
| M4 | HTTP 400 on duplicate email instead of 409 | Return 409 Conflict |
| M5 | No pagination on list endpoints | Add `limit`/`offset` or cursor pagination |
| M6 | Password reset doesn't invalidate existing tokens | Add `token_version` counter to `User` |

### 🟢 LOW

| # | Issue | Fix |
|---|---|---|
| L1 | `Team` model is defined but completely unused | Remove or wire up to an endpoint |
| L2 | `ProjectSnapshot`, `SavedTargetAudience`, `ProjectTemplate` have no APIs | Implement or remove |
| L3 | Inconsistent error response format (`detail` vs `message` vs `msg`) | Standardize on `{"detail": "..."}` |
| L4 | `Project.updated_at` never set on INSERT | Add `server_default=func.now()` |

---

> [!CAUTION]
> **C2 (invitation role tampering)** and **C3 (JWT type confusion)** are the most serious. They allow privilege escalation — a user could register as Project Manager using a Team Member invitation token.

> [!WARNING]
> **C1** (`get_current_user` returning `None`) means unprotected dashboard endpoints could return 500 errors instead of prompting login, which is both a UX and security issue.
