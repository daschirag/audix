const otpEmailTemplate = ({ otp, purpose, expiryMinutes = 5 }) => {
  const purposeText = {
    login: 'log in to',
    'forgot-password': 'reset your password for',
    'verify-email': 'verify your email for',
  };

  return {
    subject: `Your Audix OTP Code — ${otp}`,
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Audix OTP</title>
      </head>
      <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="background:#00d4d4;padding:24px 32px;">
                    <h1 style="margin:0;color:#0f0f0f;font-size:22px;font-weight:700;
                      letter-spacing:2px;">AUDIX</h1>
                    <p style="margin:4px 0 0;color:#0f0f0f;font-size:12px;opacity:0.7;">
                      Cybersecurity Training Platform
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
                      Use the code below to ${purposeText[purpose] || 'access'} your Audix account.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#0f0f0f;border:1px solid #00d4d4;border-radius:8px;
                      padding:24px;text-align:center;margin:0 0 24px;">
                      <p style="margin:0 0 8px;color:#666;font-size:12px;
                        text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
                      <p style="margin:0;color:#00d4d4;font-size:40px;font-weight:700;
                        letter-spacing:12px;font-family:monospace;">${otp}</p>
                    </div>

                    <p style="color:#666;font-size:13px;margin:0 0 8px;">
                      ⏱ This code expires in <strong style="color:#aaa;">${expiryMinutes} minutes</strong>.
                    </p>
                    <p style="color:#666;font-size:13px;margin:0;">
                      🔒 Never share this code with anyone. Audix will never ask for your OTP.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:16px 32px;border-top:1px solid #2a2a2a;">
                    <p style="margin:0;color:#444;font-size:12px;">
                      If you didn't request this, ignore this email. Your account remains secure.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `,
  };
};

const passwordResetTemplate = ({ resetURL }) => ({
  subject: 'Audix — Password Reset Request',
  html: `
  <!DOCTYPE html>
  <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;">
              <tr>
                <td style="background:#00d4d4;padding:24px 32px;">
                  <h1 style="margin:0;color:#0f0f0f;font-size:22px;font-weight:700;
                    letter-spacing:2px;">AUDIX</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
                    We received a request to reset your password.
                    Click the button below to proceed.
                  </p>
                  <a href="${resetURL}"
                    style="display:inline-block;background:#00d4d4;color:#0f0f0f;
                    text-decoration:none;padding:14px 32px;border-radius:8px;
                    font-weight:700;font-size:15px;">
                    Reset Password
                  </a>
                  <p style="color:#666;font-size:13px;margin:24px 0 0;">
                    ⏱ This link expires in <strong style="color:#aaa;">10 minutes</strong>.
                    If you didn't request this, ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `,
});

module.exports = { otpEmailTemplate, passwordResetTemplate };