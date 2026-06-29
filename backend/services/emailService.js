require('dotenv').config();

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (toEmail, otp) => {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Your StudyBuddy Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0d9488, #06b6d4); padding: 36px 40px; text-align:center;">
                      <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.5px;">StudyBuddy</h1>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Your learning journey starts here</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 40px 32px;">
                      <h2 style="margin:0 0 12px; color:#111827; font-size:20px; font-weight:600;">Verify your email address</h2>
                      <p style="margin:0 0 28px; color:#6b7280; font-size:15px; line-height:1.6;">
                        Thanks for signing up! To complete your registration and secure your account, please use the verification code below.
                      </p>

                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <div style="background:#f0fdf4; border:1.5px dashed #0d9488; border-radius:12px; padding: 28px 20px; display:inline-block; width:90%; margin: 0 auto;">
                              <p style="margin:0 0 8px; color:#6b7280; font-size:12px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase;">Your verification code</p>
                              <p style="margin:0; color:#0d9488; font-size:42px; font-weight:700; letter-spacing:12px; font-family: 'Courier New', monospace;">${otp}</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Expiry warning -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                        <tr>
                          <td style="background:#fff7ed; border-radius:8px; padding:12px 16px;">
                            <p style="margin:0; color:#92400e; font-size:13px;">
                              ⏱ This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:28px 0 0; color:#6b7280; font-size:14px; line-height:1.6;">
                        If you didn't create a StudyBuddy account, you can safely ignore this email. Someone may have entered your email address by mistake.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb; border-top:1px solid #f3f4f6; padding:24px 40px; text-align:center;">
                      <p style="margin:0 0 4px; color:#9ca3af; font-size:12px;">© ${new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
                      <p style="margin:0; color:#9ca3af; font-size:12px;">This is an automated message, please do not reply.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
      `
    });

    console.log('Email sent:', result);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

module.exports = { generateOTP, sendOTPEmail };