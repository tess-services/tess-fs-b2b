const RESEND_BASE_URL = 'https://api.resend.com';

export const sendEmail = async ({ apiKey, from, to, subject, text, html }: {
  apiKey: string; from: string; to: string; subject: string; text?: string; html?: string;
}) => {
  const response = await fetch(`${RESEND_BASE_URL}/email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, text, html }),
  });

  if (response.status !== 200) {
    throw new Error(`Failed to send email ${JSON.stringify(response)}`);
  }
}

export const sendEmailWithAttachment = async ({ apiKey, from, to, subject, text, html, attachments, replyTo }: {
  apiKey: string; from: string; to: string; subject: string; text?: string; html?: string; attachments: any[]; replyTo: string;
}) => {
  const payload = {
    from,
    to,
    subject,
    text,
    html,
    reply_to: replyTo,
    attachments: attachments.map(attachment => ({
      filename: attachment.filename,
      content: attachment.content.toString('base64')
    }))
  };

  const response = await fetch(`${RESEND_BASE_URL}/emails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to send email with attachments: ${await response.text()}`);
  }

  return await response.json();
}