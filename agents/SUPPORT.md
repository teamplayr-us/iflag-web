# SUPPORT — approved facts and answers

**The single source for what may be said publicly.** If an answer isn't here,
it isn't approved. Ask the founder, then record it here with its date.

Status key: **Confirmed** (founder, dated) · **TBD/escalate** (do not state
publicly; route to the founder).

---

## ⚠️ Open escalations

### 1. Event dates disagree across surfaces — publicly visible

| Surface | Says |
|---|---|
| Live page (`/cfp-waitlist`) | **January 22–24, 2027** |
| Social card (`og.jpg`) | **January 22–24, 2027** |
| Confirmation email | **January 22–24, 2027** |
| Airtable event record `rec9KkRfpBA6Jil6N` | **2027-01-15** |

Every signup links to that Airtable record. One is wrong and the wrong one may
be the published one. **Do not state event dates to anyone until resolved.**
Raised 2026-09-04, unresolved as of 2026-09-10.

### 2. `support@iflagyouth.com` cannot receive mail

The domain has **no MX records**. Mail to the support address bounces. The
confirmation email says "Questions? Reply to this email," which routes there.
MailerSend verification authorises *sending* only; inbound needs its own MX.
Raised 2026-09-04, unresolved.

### 3. Team notification recipients unknown

`TEAM_NOTIFY_EMAILS` is unset. Nobody internal is notified of signups.

### 4. Brand gold `#FFD54B` unexplained

Appears on the social card, nowhere in the palette. See BRAND.md.

---

## The event

| Fact | Value | Status |
|---|---|---|
| Name | CFP Flag Football Showcase | TBD — inherited |
| Segment | Youth divisions | TBD — inherited |
| Dates | January 22–24, 2027 | **ESCALATE — see #1** |
| Location | Las Vegas, NV | TBD — inherited |
| Context | During 2027 CFP National Championship weekend | TBD — inherited |
| Registration opens | Wednesday, September 16, 2026, 7:00 PM ET | TBD — inherited, drives the live countdown |
| Age groups | 8U, 10U, 12U, 14U, 16U, 18U | **Confirmed 2026-09-04** |
| Divisions | Boys, Girls | TBD — inherited |

## Policies

| Question | Approved answer | Status |
|---|---|---|
| Does joining the waitlist guarantee a spot? | **No.** "Joining the waitlist does not guarantee placement in the tournament — spots are secured through registration once it opens." | TBD — inherited copy, used verbatim on page and in email |
| What does the waitlist get me? | Notified the moment registration opens; email required, SMS optional | TBD — inherited |
| What data is collected? | Name, email, optional phone, club/org, role, age groups, boys/girls, consent flags | Confirmed by implementation |
| How is data used? | "Used only for CFP Showcase communications from iFlag Youth and is never sold." | TBD — inherited copy |
| Privacy policy | `https://iflag.org/terms/` | TBD — inherited, points at parent site |

## Contact

| | | |
|---|---|---|
| Support address | `support@iflagyouth.com` | **Confirmed 2026-09-04** — but see escalation #2 |
| Sending address | `waitlist@iflagyouth.com` | **TBD — my default, never ratified** |
| Sender display name | "iFlag Youth" | TBD — mine |
| Site | `https://iflagyouth.com` | **Confirmed 2026-09-08** |
| Waitlist page | `https://iflagyouth.com/cfp-waitlist` | **Confirmed 2026-09-08** |

## Copy approved verbatim

- Button: **"Submit & Join Waitlist"** — Confirmed 2026-09-04
- Card headline: **"Join the Waitlist"** — Confirmed 2026-09-04

## Copy NOT reviewed — do not treat as approved

- Page lede, success message, fineprint (inherited from the original page)
- **The entire confirmation email** — written by me 2026-09-10, never approved
- **The entire team notification email** — same
- Social card supporting line under the headline

## Decision log

| Date | Decision |
|---|---|
| 2026-09-04 | Contact email → `support@iflagyouth.com` |
| 2026-09-04 | Signups write to Airtable 5v5 Sports → Event Waitlist |
| 2026-09-04 | Button reads "Submit & Join Waitlist" |
| 2026-09-04 | Social card led by "Join the Waitlist" |
| 2026-09-04 | **No `×`/divider between paired logos** (brand guidelines) |
| 2026-09-04 | Age groups: High School retired; 16U and 18U added |
| 2026-09-08 | Waitlist served at `/cfp-waitlist`, root temporarily redirects |
| 2026-09-08 | `iflagyouth.com` canonical; `www` 308s to apex; `.org` owned, to redirect |
| 2026-09-08 | Youth shield becomes the favicon |
| 2026-09-08 | MailerSend verified on `iflagyouth.com` (account under review) |
| 2026-09-10 | Confirmation + team notification emails built |
| 2026-09-10 | Site Playbook adopted; these four docs created |
