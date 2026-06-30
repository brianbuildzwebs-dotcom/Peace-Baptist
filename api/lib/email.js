const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'peacebible@bellsouth.net';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Peace Baptist Church <onboarding@resend.dev>';

export async function sendNotification(type, payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const subjects = {
    contact: `New contact message from ${payload.name}`,
    prayer: `New prayer request${payload.is_anonymous ? ' (anonymous)' : ''}`,
    form: `New form submission: ${payload.form_title || payload.form_id}`,
  };

  const bodies = {
    contact: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      ${payload.phone ? `<p><strong>Phone:</strong> ${payload.phone}</p>` : ''}
      ${payload.subject ? `<p><strong>Subject:</strong> ${payload.subject}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${(payload.message || '').replace(/\n/g, '<br>')}</p>
    `,
    prayer: `
      <h2>New Prayer Request</h2>
      <p><strong>Category:</strong> ${payload.category}</p>
      ${payload.name && !payload.is_anonymous ? `<p><strong>Name:</strong> ${payload.name}</p>` : ''}
      ${payload.email && !payload.is_anonymous ? `<p><strong>Email:</strong> ${payload.email}</p>` : ''}
      <p><strong>Request:</strong></p>
      <p>${(payload.request || '').replace(/\n/g, '<br>')}</p>
    `,
    form: `
      <h2>New Form Submission</h2>
      <p><strong>Form:</strong> ${payload.form_title || payload.form_id}</p>
      ${payload.submitter_name ? `<p><strong>Name:</strong> ${payload.submitter_name}</p>` : ''}
      ${payload.submitter_email ? `<p><strong>Email:</strong> ${payload.submitter_email}</p>` : ''}
      <pre>${JSON.stringify(payload.data || {}, null, 2)}</pre>
    `,
  };

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: subjects[type] || 'Peace Baptist Church notification',
        html: bodies[type] || `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
      }),
    });
  } catch (err) {
    console.error('Email notification failed:', err);
  }
}