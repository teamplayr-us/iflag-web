# BRAND — iFlag Youth

Status key: **Confirmed** (founder said so, dated) · **TBD** (assumed or
inherited, awaiting ratification — do not treat as a rule yet).

## Name

| | | |
|---|---|---|
| Property | iFlag Youth | Confirmed 2026-09-04 |
| Parent entity | International Flag League, LLC | TBD — inherited from page footer |
| Partner credit | "powered by 5V5 Sports" (in the Youth lockup) | TBD — inherited |
| Allowed short forms | — | **TBD — never established.** "iFlag Youth" only until confirmed |
| Casing | `iFlag` — lowercase i, capital F | TBD — observed everywhere, never stated |

## Colour

Inherited from the original page stylesheet. None was chosen deliberately this
session; all are **TBD** until ratified.

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#19344b` | Headings, footer, primary text |
| `--navy-deep` | `#122636` | — |
| `--crimson` | `#ac212c` | Buttons, rules, accents |
| `--crimson-deep` | `#8e1a24` | Button hover |
| `--paper` | `#ffffff` | Page ground |
| `--mist` | `#f2f4f6` | Card fill |
| `--line` | `#dde3e8` | Borders |
| `--ink-dim` | `#5a6b7a` | Secondary text |

**Two discrepancies to resolve:**

- **Ribbon navy `#1A344B`** — sampled from the social card. One digit off
  `--navy` (`#19344b`). Almost certainly meant to be the same colour.
- **Gold `#FFD54B`** — sampled from the social card ribbon. Appears **nowhere**
  in the site palette. Either a real brand accent missing from the CSS, or an
  artifact now propagated into the card twice. **Escalate.**

## Type

| | | |
|---|---|---|
| Display / labels / uppercase | Barlow Condensed 500, 600, 700 | TBD — inherited |
| Body | Barlow 400, 500, 600 | TBD — inherited |
| Email | System stack (Helvetica/Arial) | Confirmed by playbook rule |

Loaded from Google Fonts. Moves to `next/font` on port.

## Logo usage

| Rule | Status |
|---|---|
| **No `×`, cross, or divider between paired marks.** Marks sit apart on whitespace alone | **Confirmed 2026-09-04** — cited as brand guidelines |
| Full-colour wordmark carries a white keyline, so it reads on dark grounds without a light chip | TBD — my determination; the result was accepted |
| Youth shield is the favicon / app icon | Confirmed 2026-09-08 |
| Pair gap: 56px on page (34px ≤420px), 110px on the 1200×630 card | **TBD — chosen by eye, not from a spec.** Needs a real clear-space rule |
| Youth mark sits left of a partner mark | TBD — observed once |

**Asset problem:** `assets/youth-mark.svg` is not vector. It contains zero
paths — it's a 3000px bitmap plus a greyscale alpha mask wrapped in SVG
packaging (1.44 MB). It cannot scale or optimise. **A true-vector master is
needed** for print, large format, and `next/image`.

**Favicon limit:** the shield carries four text elements (YOUTH / iFLAG /
INTERNATIONAL FLAG LEAGUE / powered by 5V5). At 16px they collapse. Sharp at
32px and up. A simplified icon-only mark — the torch glyph — would fix 16px.
**TBD: does an icon-only lockup exist?**

## Voice

**TBD — never established.** No hype level, punctuation policy, or banned
words has been set. Existing copy was inherited or written by me unreviewed.
Until the founder sets this, match the existing page's register: plain,
declarative, no exclamation marks, sentence case in prose and uppercase only
in display type.

## Vocabulary

| Say | Not | Status |
|---|---|---|
| iFlag Youth | iFlag youth, IFlag, I-Flag | TBD |
| CFP Flag Football Showcase | CFP Showcase, the Showcase | TBD — full name used everywhere so far |
| Age groups: 8U, 10U, 12U, 14U, 16U, 18U | High School (retired 2026-09-04) | **Confirmed 2026-09-04** |
| Waitlist | Pre-registration, sign-up list | TBD |
| "Submit & Join Waitlist" (button) | — | **Confirmed 2026-09-04** |
| "Join the Waitlist" (card headline) | — | **Confirmed 2026-09-04** |
| Boys / Girls | — | TBD — inherited |
| Coach / Team manager · Organization / Club director · Other | — | TBD — inherited |

**Punctuation observed** (not yet ruled): en dash in date ranges
(`Jan 22–24, 2027`), middot separators in metadata lines (` · `), ampersand
spelled `&` in the button.
