'use strict';
/**
 * Email service. Uses SMTP when configured (SMTP_HOST). Otherwise runs in
 * "dev" mode: the email is logged to the console and the caller may surface
 * the link in the API response (non-production only) so the flow is testable
 * without a real mailbox.
 */
const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = null;
if (config.mail.host) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined
  });
}

function shell(heading, intro, buttonLabel, url, footer) {
  return `<!doctype html><html><body style="margin:0;background:#0a0a0b;padding:32px 0;font-family:Helvetica,Arial,sans-serif;color:#f4f1ea">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141417;border:1px solid rgba(244,241,234,.1);border-radius:16px;overflow:hidden">
      <tr><td style="padding:34px 34px 0">
        <div style="font:600 13px/1 'Space Grotesk',monospace;letter-spacing:.35em;color:#c9a24b">MINDMAP</div>
        <h1 style="margin:18px 0 6px;font:400 30px/1.1 Georgia,serif;color:#f4f1ea">${heading}</h1>
        <p style="margin:14px 0 26px;font-size:15px;line-height:1.6;color:#b9b4a8">${intro}</p>
        <a href="${url}" style="display:inline-block;background:#c9a24b;color:#0a0a0b;text-decoration:none;font:600 14px/1 Helvetica,Arial;letter-spacing:.04em;padding:15px 28px;border-radius:40px">${buttonLabel}</a>
        <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#746f66">Or paste this link into your browser:<br><span style="color:#9c7a34;word-break:break-all">${url}</span></p>
        <hr style="border:none;border-top:1px solid rgba(244,241,234,.1);margin:28px 0 0">
        <p style="margin:18px 0 30px;font-size:12px;color:#746f66">${footer}</p>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:11px;color:#4a463f">© MindMap — Turn any resource into a living story.</p>
  </td></tr></table>
  </body></html>`;
}

async function send(to, subject, html, text) {
  if (!transporter) {
    console.log(`\n──────── DEV EMAIL ────────\nTo:      ${to}\nSubject: ${subject}\n${text}\n───────────────────────────\n`);
    return { dev: true };
  }
  await transporter.sendMail({ from: config.mail.from, to, subject, html, text });
  return { dev: false };
}

function sendVerification(to, name, url) {
  const text = `Hi ${name}, confirm your MindMap email by opening: ${url} (expires in 24 hours).`;
  const html = shell(
    'Verify your email',
    `Hi ${name || 'there'}, welcome to MindMap. Confirm this is your email to activate your account.`,
    'Verify my email', url,
    'This link expires in 24 hours and can be used once. If you didn’t create an account, you can ignore this email.'
  );
  return send(to, 'Verify your MindMap email', html, text);
}

function sendPasswordReset(to, name, url) {
  const text = `Hi ${name}, reset your MindMap password: ${url} (expires in 1 hour).`;
  const html = shell(
    'Reset your password',
    `Hi ${name || 'there'}, we received a request to reset your MindMap password.`,
    'Choose a new password', url,
    'This link expires in 1 hour and can be used once. If you didn’t request this, no action is needed.'
  );
  return send(to, 'Reset your MindMap password', html, text);
}

module.exports = { sendVerification, sendPasswordReset };
