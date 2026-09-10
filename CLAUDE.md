# iFlag Youth — repo guide

The iFlag Youth website. Today it is one live waitlist page; it becomes the
full brand site. Built under the Site Playbook framework — see the four docs
below, which are the source of truth. **Chat memory is not.**

| Doc | Holds |
|---|---|
| `CLAUDE.md` | This file: where things live, rules, conventions |
| `BRAND.md` | Colours, type, logo usage, voice, vocabulary |
| `agents/SUPPORT.md` | Every approved public fact. Nothing ships that isn't here |
| `OPERATIONS.md` | Form → Airtable → email flow, env vars, manual steps |

## Non-negotiable rules

1. **Never invent a fact.** Dates, prices, cities, divisions, names come from
   `agents/SUPPORT.md` or the founder. If it isn't there, ask — then record the
   answer with its date so it's never asked twice.
2. **The founder vets all public copy** before it ships. Draft → approve → ship.
3. **Facts change everywhere in one pass.** A date lives on the page, the social
   card, the confirmation email, and the Airtable event record. Nothing public
   may drift. There is currently an unresolved drift — see SUPPORT.md.
4. **Verify deploys, don't assume them.** Push, then curl production until the
   change is actually live. Vercel deploys `main`, not feature branches — a
   merged PR is not a deployed change.
5. **Secrets stay in the environment.** No token in the repo, ever. The browser
   never talks to Airtable or MailerSend directly; it posts to `/api/*`.
6. **A lost email must never fail a form submission.** See OPERATIONS.md.
7. Send image/PDF deliverables as downloadable attachments — the founder is
   usually on a phone.

## Current layout (pre-Next.js)

```
cfp-waitlist/index.html   The live waitlist page. Self-contained: inline
                          <style>, inline <script>, 5 logos as base64 webp.
cfp-waitlist/og.jpg       Social card, 1200×630.
api/waitlist.js           Serverless: validates → Airtable → email.
                          CommonJS, zero npm deps.
assets/youth-mark.svg     Youth shield source (see BRAND.md — not true vector).
favicon.ico               16/32/48 multi-res, generated from the shield.
apple-touch-icon.png      180px.
vercel.json               Root → /cfp-waitlist, temporary (307).
```

No `package.json`, no framework, no build step. Deploys in seconds.

## Deploy

Work on a branch, PR to `main`. Vercel deploys `main` on merge. Then verify:

```
curl -s https://iflagyouth.com/cfp-waitlist | grep -o '<title>[^<]*'
```

Frameworks inject `<!-- -->` comment nodes into rendered text — strip them
before grepping once we're on Next.js.

## Next.js adoption

Per the playbook, the skeleton goes up when the full site build begins and the
waitlist page ports in as its first page, preserving approved copy and look
verbatim. **The waitlist stays live throughout**; cut over only when the new
deployment serves it identically.

Known port costs, in order of effort:

1. **The form is raw DOM manipulation** — `getElementById`,
   `querySelectorAll(':checked')`, direct `textContent` writes. The submit
   handler and countdown are rewritten as a client component.
2. **`api/waitlist.js` is CommonJS `(req, res)`.** App Router wants
   `export async function POST(request)` returning `Response`; all nine response
   paths change shape. This is the piece that must not break — it is the only
   thing capturing signups.
3. **Five logos are base64 data URIs** inside a 142 KB HTML file. Extract to
   real files before `next/image` is any use.
4. `vercel.json` → `next.config.js` redirects. Trivial.
5. Google Fonts `<link>` → `next/font` (self-hosted, no layout shift).

Nothing path-relative exists in the page, so the move itself is safe.

**Sequencing:** do not port during a period when signups matter. Stand the
skeleton up alongside; `cfp-waitlist/` can serve from `public/` untouched.
