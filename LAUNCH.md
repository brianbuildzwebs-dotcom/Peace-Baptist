# Peace Baptist — launch checklist

**Current issue (verified):** `https://peacebaptist.net/api/health` reports  
`supabaseProjectRef: hxtlrwibkdyirnvejfor` — that is **Simple Streamz production**, not a church-only database.  
Fix this before go-live.

---

## Step 1 — Create a dedicated Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name it e.g. `peace-baptist-website` (any region is fine)
3. Save the new project ref (subdomain before `.supabase.co`)

You will **not** use `hxtlrwibkdyirnvejfor` for this site.

---

## Step 2 — Run church schema (new project only)

1. Supabase → **SQL Editor** → New query
2. Paste and run the full file: `supabase/schema.sql`
3. Confirm seed data:

```sql
select
  (select count(*) from public.ministries) as ministries,
  (select count(*) from public.events) as events,
  (select count(*) from public.testimonials) as testimonials;
```

Expect ministries ≥ 5, events ≥ 3, testimonials ≥ 3.

---

## Step 3 — Create church admin login

1. Supabase → **Authentication** → **Users** → **Add user**
2. Email: staff account you want for `/admin` (e.g. `peacebible@bellsouth.net` or your email while building)
3. Password: strong password, check **Auto Confirm User**
4. Run `supabase/set-admin.sql` in SQL Editor — **change the email** in that file to match step 2

---

## Step 4 — Update Vercel environment variables

Vercel → **Peace-Baptist** project → **Settings** → **Environment Variables**

Replace Supabase values with the **new** project (Production + Preview):

| Variable | Value |
|----------|--------|
| `SUPABASE_URL` | `https://YOUR-NEW-REF.supabase.co` |
| `SUPABASE_ANON_KEY` | anon key from new project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only — never commit) |
| `VITE_SUPABASE_URL` | same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | same as `SUPABASE_ANON_KEY` |

Keep these (already set):

| Variable | Expected |
|----------|----------|
| `RESEND_API_KEY` | your Resend key |
| `ADMIN_EMAIL` | church inbox for notifications (`peacebible@bellsouth.net` recommended) |
| `FROM_EMAIL` | `Peace Baptist Church <notifications@peacebaptist.net>` |
| `SITE_URL` | `https://peacebaptist.net` |

**Remove or ignore** any vars pointing at `hxtlrwibkdyirnvejfor`.

Then: **Deployments** → latest → **Redeploy** (uncheck “Use existing build” if offered, so env is picked up).

---

## Step 5 — Verify production

Open:

```
https://peacebaptist.net/api/health
```

Must show:

- `"ok": true`
- `"supabaseProjectRef": "YOUR-NEW-REF"` (**not** `hxtlrwibkdyirnvejfor`)

---

## Step 6 — Smoke test the site

| Test | URL / action |
|------|----------------|
| Home loads | https://peacebaptist.net |
| Events from DB | https://peacebaptist.net/events |
| Prayer wall submit | https://peacebaptist.net/prayer-requests |
| Contact form | https://peacebaptist.net/contact |
| Admin login | https://peacebaptist.net/login → `/admin` |
| Watch Live player | https://peacebaptist.net/watch-live |
| Email notification | Submit a test prayer — check `ADMIN_EMAIL` inbox |

---

## Step 7 — Simple Streamz (separate product)

Streaming uses your embed only — **no** Peace Baptist row needed in Simple Streamz for the website.

1. Embed is configured in `src/lib/churchInfo.js` (`channelId` + `https://simplestreamz.io`)
2. Optional: remove test user from Simple Streamz prod — run  
   `scripts/remove-peace-baptist-test-account.sql` in the **Simple Streamz** repo (Supabase `hxtlrwibkdyirnvejfor`)

---

## Step 8 — Git push (after local fixes)

```bash
cd "C:\Users\Brian\Downloads\Peace-Baptist"
git add src/lib/churchInfo.js LAUNCH.md
git commit -m "Point live embed at simplestreamz.io and add launch checklist"
git push origin main
```

Vercel will auto-deploy from GitHub.

---

## Quick reference — two projects, never mix

| | Peace Baptist website | Simple Streamz |
|--|----------------------|----------------|
| Repo | `Peace-Baptist` | `simple-stream-core` |
| Hosting | Vercel | Cloudflare Workers |
| Database | `arqdowwawfjfypigwxhp` (church-only) | `hxtlrwibkdyirnvejfor` |
| Domain | peacebaptist.net | simplestreamz.io |
| Link between them | Embed on Watch Live only | — |

---

## Transfer database to church-owned Supabase account

**Current state (verified):** Production uses project `arqdowwawfjfypigwxhp` — already separate from Simple Streamz.  
**Goal:** Move that project under a Supabase organization the **church owns** (e.g. `peacebible@bellsouth.net`), not your personal developer account.

### Option A — Transfer existing project (recommended)

Keeps all data, users, and API keys. **Vercel env vars do not change** after transfer.

**Church side (one-time):**

1. Pastor or office staff creates/login at [supabase.com](https://supabase.com) with **church email** (`peacebible@bellsouth.net` or official church Gmail).
2. Create a new **Organization** (e.g. `Peace Baptist Church`).
3. Stay on **Free** plan unless you need Pro features — fine for this site.
4. Send you (Brian) the church Supabase account email so you can be invited.

**Your side (Brian):**

1. Supabase → your org → project `arqdowwawfjfypigwxhp` → **Settings** → **General**.
2. Scroll to **Transfer project** → choose church organization → confirm.
3. Requirements: you must be **Owner** of source org; church must add you as **member** of target org (temporarily).

**After transfer:**

1. Church org **Owner** invites/removes your access as needed (you can stay as collaborator during build-out).
2. In church-owned project → **Authentication** → **Users**:
   - Add `peacebible@bellsouth.net` (or staff email) with password + **Auto Confirm**.
3. Run `supabase/set-admin.sql` — change email to church staff, not `brianbuildzwebs@gmail.com`.
4. Optional: demote or delete your test admin user when church login works.
5. Verify: `https://peacebaptist.net/api/health` still shows `arqdowwawfjfypigwxhp` and `ok: true`.
6. Run `supabase/verify-transfer.sql` in SQL Editor — confirm row counts and admin role.

**Vercel:** No change required if project ref stays the same. Update `ADMIN_EMAIL` to `peacebible@bellsouth.net` when ready, then redeploy.

### Option B — New project under church account (only if transfer blocked)

Use if GitHub integration or other blockers prevent transfer.

1. Church creates new Supabase project under their org.
2. Run full `supabase/schema.sql` on new project.
3. Export data from old project (Table Editor → CSV, or `pg_dump` via Supabase CLI).
4. Import into new project; recreate **Authentication → Users** manually (passwords do not export).
5. Update **all** Vercel env vars (`SUPABASE_URL`, keys, `VITE_*`) to new project ref → redeploy.
6. Confirm health endpoint shows new ref.

### Optional — Transfer Vercel too (full church ownership)

Database transfer alone leaves the site on your Vercel account. For full handoff:

1. Add church staff as Vercel team member, or
2. Transfer **Peace-Baptist** project to church Vercel team (Pro feature), or
3. Church connects their GitHub + Vercel; you add env vars; they deploy.

Domain `peacebaptist.net` DNS stays wherever it is — only point nameservers/DNS if hosting moves.

### Transfer checklist

| Step | Who | Done |
|------|-----|------|
| Church Supabase org created | Church | ☐ |
| Project transferred to church org | Brian | ☐ |
| Church admin user in Auth | Church/Brian | ☐ |
| `set-admin.sql` run for church email | Brian | ☐ |
| `/admin` login tested | Church | ☐ |
| `verify-transfer.sql` row counts OK | Brian | ☐ |
| `ADMIN_EMAIL` → church inbox in Vercel | Brian | ☐ |
| Health check still `ok: true` | Brian | ☐ |
| Your test accounts removed (optional) | Brian | ☐ |