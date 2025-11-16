// utils/mailer.js
const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // 465 হলে true, 587 হলে false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * নতুন employee login ইমেইল
 */
async function sendEmployeeLoginEmail({ to, name, roleName, tempPassword, verifyUrl }) {
  const from =
    process.env.SMTP_FROM || `"Interior CRM" <${process.env.SMTP_USER}>`;

  const subject = 'Your Interior CRM login details';

  const safeName = name || 'User';

  const text =
    `Hi ${safeName},\n\n` +
    `Your Interior CRM login has been created.\n\n` +
    `Role: ${roleName || 'User'}\n` +
    `Login email: ${to}\n` +
    `Temporary password: ${tempPassword}\n\n` +
    (verifyUrl
      ? `Please verify your email and set a new password from:\n${verifyUrl}\n\n`
      : '') +
    `If you did not expect this email, please contact your administrator.\n\n` +
    `— Interior CRM`;

  const html = `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; background: #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 30px rgba(15,23,42,0.08);">
      <tr>
        <td style="background: linear-gradient(135deg, #2563eb, #0f172a); padding: 18px 24px; color: #e5f0ff;">
          <h1 style="margin: 0; font-size: 18px; letter-spacing: .03em; text-transform: uppercase;">Interior CRM</h1>
          <div style="font-size: 13px; opacity: .85;">Your account is ready</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">
            Hi ${escapeHtml(safeName)},
          </p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
            A login has been created for you in <strong>Interior CRM</strong>.
          </p>

          <table cellpadding="0" cellspacing="0" style="width: 100%; margin: 12px 0 18px; font-size: 14px; color: #111827;">
            <tr>
              <td style="padding: 4px 0; width: 120px; color: #6b7280;">Role</td>
              <td style="padding: 4px 0;"><strong>${escapeHtml(roleName || 'User')}</strong></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Login email</td>
              <td style="padding: 4px 0;"><strong>${escapeHtml(to)}</strong></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Temporary password</td>
              <td style="padding: 4px 0;"><code style="background:#f9fafb; padding:4px 6px; border-radius:4px;">${escapeHtml(
                tempPassword
              )}</code></td>
            </tr>
          </table>

          ${
            verifyUrl
              ? `<p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                  Please verify your email and set a new password using the button below:
                 </p>
                 <p style="margin: 0 0 20px;">
                  <a href="${verifyUrl}"
                     style="display:inline-block; padding:10px 18px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:999px; font-size:14px; font-weight:500;">
                    Verify email &amp; sign in
                  </a>
                 </p>`
              : ''
          }

          <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">
            For security, please change your password after you first log in.
          </p>
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            If you did not expect this email, please contact your administrator.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
          <div style="font-size: 11px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} Interior CRM. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

// ছোট helper
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  transporter,
  sendEmployeeLoginEmail,
};
