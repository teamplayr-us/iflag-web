/* Waitlist intake: browser -> this function -> Airtable.
 *
 * The Airtable token lives only in the AIRTABLE_TOKEN environment variable on
 * the server. It must never reach the client, which is the whole reason the
 * page posts here instead of talking to Airtable directly.
 */

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID  = 'appbmlh3CKFrW6c72'; // 5v5 Sports
const TABLE_ID = 'tblSb2l8EX6ZVX90M'; // Event Waitlist
const EVENT_ID = 'rec9KkRfpBA6Jil6N'; // Event Inventory -> CFP Flag Football Showcase

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

const str  = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = (v, allowed) => (Array.isArray(v) ? v.filter(x => allowed.includes(x)) : []);

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

  const firstName = str(body.first_name, 100);
  const lastName  = str(body.last_name, 100);
  const email     = str(body.email, 254).toLowerCase();
  const club      = str(body.club_name, 200);
  const role      = str(body.role, 100);

  const missing = [];
  if (!firstName) missing.push('first_name');
  if (!lastName)  missing.push('last_name');
  if (!email)     missing.push('email');
  if (!club)      missing.push('club_name');
  if (missing.length) return res.status(400).json({ error: 'Missing required fields', fields: missing });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (body.consent_email !== true) {
    return res.status(400).json({ error: 'Email consent is required to join the waitlist' });
  }

  const fields = {
    [F.event]:      [EVENT_ID],
    [F.firstName]:  firstName,
    [F.lastName]:   lastName,
    [F.email]:      email,
    [F.club]:       club,
    [F.ageGroups]:  pick(body.age_groups, AGE_GROUPS),
    [F.genders]:    pick(body.genders, GENDERS),
    [F.optInEmail]: true,
    [F.optInSms]:   body.consent_sms === true,
  };

  const phone = str(body.phone, 40);
  if (phone) fields[F.phone] = phone;
  if (ROLES.includes(role)) fields[F.role] = role;

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

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Airtable request failed', err);
    return res.status(502).json({ error: 'Could not save signup' });
  }
};
