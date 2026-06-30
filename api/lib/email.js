function env(name, fallback = '') {
  const value = process.env[name];
  return (typeof value === 'string' ? value.trim() : value) || fallback;
}

export function isResendConfigured() {
  return Boolean(env('RESEND_API_KEY'));
}

export function getAdminEmail() {
  return env('ADMIN_EMAIL', 'peacebible@bellsouth.net');
}

export function getFromEmail() {
  return env('FROM_EMAIL', 'Peace Baptist Church <onboarding@resend.dev>');
}

export async function sendNotification(type, payload) {
  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('Resend skipped: RESEND_API_KEY not set');
    return { sent: false, reason: 'not_configured' };
  }

  const adminEmail = getAdminEmail();
  const fromEmail = getFromEmail();

  const subjects = {
    contact: `New contact message from ${payload.name}`,
    prayer: `New prayer request${payload.is_anonymous ? ' (anonymous)' : ''}`,
    form: `New form submission: ${payload.form_title || payload.form_id}`,
  };

  const bodies = {
    contact: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      ${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ''}
      ${payload.subject ? `<p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(payload.message || '').replace(/\n/g, '<br>')}</p>
    `,
    prayer: `
      <h2>New Prayer Request</h2>
      <p><strong>Category:</strong> ${escapeHtml(payload.category)}</p>
      ${payload.name && !payload.is_anonymous ? `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>` : ''}
      ${payload.email && !payload.is_anonymous ? `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>` : ''}
      <p><strong>Request:</strong></p>
      <p>${escapeHtml(payload.request || '').replace(/\n/g, '<br>')}</p>
    `,
    form: `
      <h2>New Form Submission</h2>
      <p><strong>Form:</strong> ${escapeHtml(payload.form_title || payload.form_id)}</p>
      ${payload.submitter_name ? `<p><strong>Name:</strong> ${escapeHtml(payload.submitter_name)}</p>` : ''}
      ${payload.submitter_email ? `<p><strong>Email:</strong> ${escapeHtml(payload.submitter_email)}</p>` : ''}
      <pre>${escapeHtml(JSON.stringify(payload.data || {}, null, 2))}</pre>
    `,
  };

  const replyTo = payload.email || payload.submitter_email || undefined;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: subjects[type] || 'Peace Baptist Church notification',
        html: bodies[type] || `<pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Resend API error:', response.status, errorBody);
      return { sent: false, reason: 'api_error', status: response.status, detail: errorBody };
    }

    return { sent: true };
  } catch (err) {
    console.error('Email notification failed:', err);
    return { sent: false, reason: 'network_error', detail: err.message };
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}