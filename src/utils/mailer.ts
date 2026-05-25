// src/utils/mailer.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true cho port 465, false cho các port khác
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Hàm hỗ trợ gửi OTP nhanh
export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const mailOptions = {
    from: `"My E-Commerce" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[My E-Commerce] Mã xác thực OTP của bạn`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Xác Thực Tài Khoản</h2>
        <p>Chào bạn,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Mã OTP để hoàn tất quá trình xác thực của bạn là:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0070f3; border-radius: 4px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #666; font-size: 13px;">Mã OTP này có hiệu lực trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}