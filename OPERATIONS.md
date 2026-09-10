# OPERATIONS — how a signup actually flows

## Hosting

Vercel, deploying **`main`** only. Feature branches do not deploy — a merged PR
is not a live change until Vercel finishes, and env var changes need a redeploy
to take effect.

| Domain | Behaviour |
|---|---|
| `iflagyouth.com` | Serves the site (apex is primary) |
| `www.iflagyouth.com` | 308 → apex, path preserved |
| `iflagyouth.com/` | 307 → `/cfp-waitlist` (temporary, so a homepage can take the root) |
| `iflagyouth.org`, `www.iflagyouth.org` | **Not configured.** Still parked at the registrar |

DNS at GoDaddy. Apex `A` → `216.150.1.1`; `www` CNAME → the project's
`*.vercel-dns-016.com` hostname.

## Signup flow

```
browser (/cfp-waitlist)
   │  POST /api/waitlist   (same-origin, JSON)
   ▼
api/waitlist.js
   │  1. honeypot → 200, write nothing
   │  2. validate: required fields, email shape, email consent
   │  3. allowlist age_groups / genders / role
   │  4. POST Airtable  ── failure → 502, nothing sent
   │  5. email registrant + team  ── failure → LOGGED AND SWALLOWED
   ▼
200 {ok:true}
```

**Step 5 can never fail the request.** By then the signup is saved; an error
would show a failure for data we hold and invite a duplicate submission. Both
sends go through `Promise.allSettled` so one failing doesn't suppress the other.

## Airtable

| | |
|---|---|
| Base | `appbmlh3CKFrW6c72` — 5v5 Sports |
| Table | `tblSb2l8EX6ZVX90M` — Event Waitlist |
| Event link | `rec9KkRfpBA6Jil6N` — CFP Flag Football Showcase |

Written **by field ID**, not name, so renaming a field in the Airtable UI can't
break writes. Field IDs are in `api/waitlist.js`.

**`typecast` is deliberately off.** Combined with the server-side allowlist,
this means a tampered payload cannot mint new select options in the base. The
tradeoff: **any new age group or role must be added as an Airtable choice
before the code offers it**, or writes 422. The API can add select choices (via
a throwaway typecast write) but cannot delete them — removals are manual.

**Housekeeping:** `"High School"` is still a choice on the Age Groups field,
unused since 2026-09-04. Delete via the Airtable UI.

## Email — MailerSend

**Status: account under review as of 2026-09-08.** Until it clears, sends fail
with 422. Signups still save; nobody is emailed.

Two messages per signup:

1. **Confirmation** → registrant. `reply_to: support@iflagyouth.com`.
2. **Team notification** → `TEAM_NOTIFY_EMAILS`. Carries every field plus a deep
   link to the new Airtable row. `reply_to` is the registrant, so replying
   answers them directly.

DNS on `iflagyouth.com`, all verified live 2026-09-08:

| Record | Value |
|---|---|
| SPF (TXT `@`) | `v=spf1 include:_spf.mailersend.net ~all` |
| DKIM | `ms1._domainkey`, `ms2._domainkey` → `.mailersend.net` |
| Return-Path | `mta` → `mailersend.net` |
| DMARC | `_dmarc` → `p=quarantine` |

**Cleanup:** `iflagyouth.org` still carries a stale MailerSend SPF record from
an earlier mixup. Remove it — it authorises a sender we don't use.

**Only one SPF record per domain.** If Google Workspace is added for inbound,
merge its include into the existing TXT; do not add a second.

### Known deviations from the playbook's email rules

The playbook specifies a **620px table layout** and warns that **mobile
dark-mode clients force-invert custom dark backgrounds**. The current
confirmation email:

- uses a **560px div layout**, not a 620px table — **fix on next revision**
- has a **navy footer band** drawn in CSS. Per the playbook this is exactly what
  gets force-inverted. It should become a **pre-composed image**, which clients
  never recolour. **Fix before first real send.**

It does correctly use a light body and a system font stack.

## Environment variables (Vercel)

| Variable | Required | Effect if unset |
|---|---|---|
| `AIRTABLE_TOKEN` | **Yes** | 500; no signup saved. **Set 2026-09-04** |
| `MAILERSEND_API_KEY` | No | Signups save, no mail, warning logged. **Not set** |
| `TEAM_NOTIFY_EMAILS` | No | No team notification. Comma-separated. Value confirmed 2026-09-10 (below); **not yet set in Vercel** |
| `MAIL_FROM` | No | Defaults to `waitlist@iflagyouth.com` |

Env vars apply at build time — **redeploy after changing any of them.**

## Manual steps not yet done

1. Set `MAILERSEND_API_KEY`, and `TEAM_NOTIFY_EMAILS` to:
   `allen@5v5sports.com,monty.holloway@5v5sports.com`
   then redeploy. **Merge the email rebuild first** — production still runs the
   pre-playbook template and `/email/header.png` 404s until it lands.
2. Add **MX records** so `support@iflagyouth.com` can receive (escalation #2)
3. Point `iflagyouth.org` + `www` at Vercel as redirects to the `.com`
4. Remove the stale MailerSend SPF from `iflagyouth.org`
5. Delete the `"High School"` choice from the Airtable Age Groups field

## Verifying a deploy

```
curl -s https://iflagyouth.com/cfp-waitlist | grep -o '<title>[^<]*'
curl -s -o /dev/null -w '%{http_code}\n' https://iflagyouth.com/favicon.ico
curl -s -X POST https://iflagyouth.com/api/waitlist \
     -H 'Content-Type: application/json' -d '{}'      # expect 400 + field list
```

A `{}` POST returning the missing-fields list proves the endpoint is live
without writing a record.
