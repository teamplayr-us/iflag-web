/* Waitlist intake: browser -> this function -> Airtable, then email.
 *
 * The Airtable and MailerSend tokens live only in environment variables on the
 * server. They must never reach the client, which is the whole reason the page
 * posts here instead of talking to either service directly.
 *
 * Environment:
 *   AIRTABLE_TOKEN      required. Scoped to the 5v5 Sports base, data.records:write.
 *   MAILERSEND_API_KEY  optional. Without it, signups still save; no mail is sent.
 *   TEAM_NOTIFY_EMAILS  optional. Comma-separated internal recipients.
 *   MAIL_FROM           optional. Defaults to waitlist@iflagyouth.com.
 */

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID  = 'appbmlh3CKFrW6c72'; // 5v5 Sports
const TABLE_ID = 'tblSb2l8EX6ZVX90M'; // Event Waitlist
const EVENT_ID = 'rec9KkRfpBA6Jil6N'; // Event Inventory -> CFP Flag Football Showcase

const MAILERSEND_API = 'https://api.mailersend.com/v1/email';
const REPLY_TO   = 'support@iflagyouth.com';
const SITE       = 'https://iflagyouth.com';
const EVENT_NAME = 'CFP Flag Football Showcase';
const EVENT_WHEN = 'January 22–24, 2027 · Las Vegas, NV';
const OPENS_WHEN = 'Wednesday, September 16 at 7:00 PM ET';

/* Keyed by field ID, following the convention the other 5v5/CFSS intake tables
 * use: fields can be renamed in Airtable without breaking this endpoint. */
const F = {
  event:      'fldQTJVpNxUzEpf4b',
  firstName:  'fldtJqkHLPnZx2VDC',
  lastName:   'fldjia0XmCamjYkIQ',
  email:      'fldngKQgGhoXylzoo',
  phone:      'fld535dFAI3NBf9Ir',
  club:       'fldHgsq5ubtCDkDxP',
  role:       'fldBzueCuxpbn6C5A',
  ageGroups:  'fldUIcvjpSZyxoOj8',
  genders:    'fldd6mrKZwZEiWn0d',
  optInEmail: 'fldPRj4LPLtJTWwed',
  optInSms:   'fld0QEz1PkLABCji9',
};

/* Mirrors the multipleSelects choices and the form's dropdown. Anything outside
 * these lists is dropped rather than sent on: we deliberately do not pass
 * typecast to Airtable, so a tampered payload can never mint new select
 * options in the base. */
const AGE_GROUPS = ['8U', '10U', '12U', '14U', '16U', '18U'];
const GENDERS    = ['Boys', 'Girls'];
const ROLES      = ['Coach / Team manager', 'Organization / Club director', 'Other'];

/* Palette mirrors BRAND.md exactly. Do not re-type hexes here by hand. */
const NAVY = '#19344b', CRIMSON = '#ac212c', DIM = '#5a6b7a', LINE = '#dde3e8', MIST = '#f2f4f6';

const str  = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = (v, allowed) => (Array.isArray(v) ? v.filter(x => allowed.includes(x)) : []);

/* Submissions are attacker-controlled and land inside HTML mail. Escape every
 * interpolated value so a club name can never inject markup into an inbox. */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

async function sendEmail({ apiKey, to, subject, html, text, replyTo }) {
  const from = process.env.MAIL_FROM || 'waitlist@iflagyouth.com';
  const r = await fetch(MAILERSEND_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: { email: from, name: 'iFlag Youth' },
      to,
      ...(replyTo ? { reply_to: { email: replyTo, name: 'iFlag Youth' } } : {}),
      subject, html, text,
    }),
  });
  if (!r.ok) throw new Error(`MailerSend ${r.status}: ${await r.text()}`);
}

/* Email layout rules (Site Playbook, learned the hard way):
 *   - 620px table layout, inline styles, system fonts.
 *   - LIGHT body throughout. Mobile dark-mode clients force-invert custom dark
 *     backgrounds, so a navy band drawn in CSS gets wrecked.
 *   - The dark brand header is therefore a PRE-COMPOSED IMAGE. Clients never
 *     recolour images. Served from /email/header.png at 2x for retina.
 * Anything dark that must survive belongs in that image, not in markup. */
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function shell(innerHtml) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f8;margin:0;padding:0">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:620px;max-width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:8px;overflow:hidden">
<tr><td style="padding:0;line-height:0"><img src="${SITE}/email/header.png" width="620" alt="iFlag Youth" style="display:block;width:100%;max-width:620px;height:auto;border:0"></td></tr>
${innerHtml}
</table>
</td></tr></table>`;
}

function confirmationEmail(s) {
  const teams = [s.ageGroups.join(', '), s.genders.join(' & ')].filter(Boolean).join(' · ');
  const row = (k, v) => `<tr><td style="padding:6px 0;font-size:13px;color:${DIM};font-family:${FONT}">${k}</td><td style="padding:6px 0;font-size:13px;text-align:right;color:${NAVY};font-family:${FONT}">${v}</td></tr>`;

  const html = shell(`<tr><td style="padding:28px 28px 24px;font-family:${FONT};color:${NAVY}">
  <h1 style="margin:0;font-size:23px;line-height:1.2;text-transform:uppercase;color:${NAVY}">You're on the list</h1>
  <div style="height:2px;background:${CRIMSON};width:110px;margin:14px 0 18px;font-size:0;line-height:0">&nbsp;</div>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.55">Thanks, ${esc(s.firstName)} — ${esc(s.club)} is on the youth waitlist for the ${EVENT_NAME}.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MIST};border-radius:6px;margin:0 0 18px">
    <tr><td style="padding:16px 18px;font-family:${FONT}">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${DIM}">Registration opens</div>
      <div style="font-size:18px;font-weight:bold;color:${NAVY};padding-top:4px">${OPENS_WHEN}</div>
    </td></tr>
  </table>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.55">We'll email you the moment it does.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};margin:0 0 18px">
    ${row('Event', EVENT_NAME)}${row('Dates', EVENT_WHEN)}${teams ? row('Your teams', esc(teams)) : ''}
  </table>
  <p style="margin:0;font-size:13px;line-height:1.55;color:${DIM}">Joining the waitlist does not guarantee placement — spots are secured through registration once it opens.</p>
</td></tr>
<tr><td style="padding:16px 28px;background:${MIST};border-top:1px solid ${LINE};font-family:${FONT};font-size:12px;color:${DIM};text-align:center">© 2026 International Flag League, LLC</td></tr>`);

  const text = `You're on the list.

Thanks, ${s.firstName} — ${s.club} is on the youth waitlist for the ${EVENT_NAME}.

REGISTRATION OPENS
${OPENS_WHEN}

We'll email you the moment it does.

Event: ${EVENT_NAME}
Dates: ${EVENT_WHEN}${teams ? `\nYour teams: ${teams}` : ''}

Joining the waitlist does not guarantee placement — spots are secured through
registration once it opens.

© 2026 International Flag League, LLC`;
  return { subject: `You're on the waitlist — ${EVENT_NAME}`, html, text };
}

function teamEmail(s, recordId) {
  const link = recordId ? `https://airtable.com/${BASE_ID}/${TABLE_ID}/${recordId}` : null;
  const rows = [
    ['Name',        `${s.firstName} ${s.lastName}`],
    ['Email',       s.email],
    ['Phone',       s.phone || '—'],
    ['Club / Org',  s.club],
    ['Role',        s.role || '—'],
    ['Age groups',  s.ageGroups.join(', ') || '—'],
    ['Boys/Girls',  s.genders.join(', ') || '—'],
    ['SMS opt-in',  s.optInSms ? 'Yes' : 'No'],
  ];
  const html = shell(`<tr><td style="padding:26px 28px;font-family:${FONT};color:${NAVY}">
  <h1 style="margin:0 0 2px;font-size:19px;color:${NAVY}">New youth waitlist signup</h1>
  <p style="margin:0 0 18px;font-size:13px;color:${DIM}">${EVENT_NAME}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px">
${rows.map(([k, v]) => `    <tr><td style="padding:7px 12px 7px 0;color:${DIM};white-space:nowrap;border-bottom:1px solid ${LINE};font-family:${FONT}">${k}</td><td style="padding:7px 0;border-bottom:1px solid ${LINE};font-family:${FONT};color:${NAVY}">${esc(v)}</td></tr>`).join('\n')}
  </table>
  ${link ? `<p style="margin:20px 0 0;font-size:14px"><a href="${link}" style="color:${CRIMSON};font-weight:bold;text-decoration:none">Open in Airtable →</a></p>` : ''}
</td></tr>`);
  const text = `New youth waitlist signup — ${EVENT_NAME}\n\n`
    + rows.map(([k, v]) => `${k}: ${v}`).join('\n')
    + (link ? `\n\nOpen in Airtable: ${link}` : '');
  return { subject: `New youth waitlist signup — ${s.club}`, html, text };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    console.error('AIRTABLE_TOKEN is not set — cannot write waitlist signup');
    return res.status(500).json({ error: 'Server not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Malformed JSON' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Malformed request' });

  // Honeypot: bots fill it, humans never see it. Accept silently so they don't retry.
  if (str(body.company, 100)) return res.status(200).json({ ok: true });

  const s = {
    firstName: str(body.first_name, 100),
    lastName:  str(body.last_name, 100),
    email:     str(body.email, 254).toLowerCase(),
    club:      str(body.club_name, 200),
    role:      str(body.role, 100),
    phone:     str(body.phone, 40),
    ageGroups: pick(body.age_groups, AGE_GROUPS),
    genders:   pick(body.genders, GENDERS),
    optInSms:  body.consent_sms === true,
  };

  const missing = [];
  if (!s.firstName) missing.push('first_name');
  if (!s.lastName)  missing.push('last_name');
  if (!s.email)     missing.push('email');
  if (!s.club)      missing.push('club_name');
  if (missing.length) return res.status(400).json({ error: 'Missing required fields', fields: missing });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (body.consent_email !== true) {
    return res.status(400).json({ error: 'Email consent is required to join the waitlist' });
  }
  if (!ROLES.includes(s.role)) s.role = '';

  const fields = {
    [F.event]:      [EVENT_ID],
    [F.firstName]:  s.firstName,
    [F.lastName]:   s.lastName,
    [F.email]:      s.email,
    [F.club]:       s.club,
    [F.ageGroups]:  s.ageGroups,
    [F.genders]:    s.genders,
    [F.optInEmail]: true,
    [F.optInSms]:   s.optInSms,
  };
  if (s.phone) fields[F.phone] = s.phone;
  if (s.role)  fields[F.role]  = s.role;

  let recordId = null;
  try {
    const r = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [{ fields }], returnFieldsByFieldId: true }),
    });

    if (!r.ok) {
      // Log detail server-side; the client gets nothing that describes the base.
      console.error('Airtable rejected waitlist write', r.status, await r.text());
      return res.status(502).json({ error: 'Could not save signup' });
    }
    const saved = await r.json();
    recordId = saved?.records?.[0]?.id || null;
  } catch (err) {
    console.error('Airtable request failed', err);
    return res.status(502).json({ error: 'Could not save signup' });
  }

  /* The signup is already saved. From here nothing may fail the request: an
   * error now would show the visitor a failure for a signup we hold, and they
   * would submit again. Mail problems are logged and swallowed. */
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (apiKey) {
    const team = (process.env.TEAM_NOTIFY_EMAILS || '')
      .split(',').map(e => e.trim()).filter(Boolean);

    const jobs = [];

    const conf = confirmationEmail(s);
    jobs.push(sendEmail({
      apiKey, to: [{ email: s.email, name: `${s.firstName} ${s.lastName}` }],
      replyTo: REPLY_TO, ...conf,
    }).catch(e => console.error('Confirmation email failed', s.email, e.message)));

    if (team.length) {
      const note = teamEmail(s, recordId);
      jobs.push(sendEmail({
        apiKey, to: team.map(email => ({ email })), replyTo: s.email, ...note,
      }).catch(e => console.error('Team notification failed', e.message)));
    }

    await Promise.allSettled(jobs);
  } else {
    console.warn('MAILERSEND_API_KEY not set — signup saved, no mail sent');
  }

  return res.status(200).json({ ok: true });
};
