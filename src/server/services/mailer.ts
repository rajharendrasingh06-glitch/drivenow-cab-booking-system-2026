import nodemailer from 'nodemailer';

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

let transporter: any = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  if (isSmtpConfigured && transporter) {
    try {
      await transporter.sendMail({
        from: `"DriveNow Support" <${process.env.SMTP_USER || 'support@drivenow.in'}>`,
        to,
        subject,
        text: text || subject,
        html,
      });
      console.log(`[DriveNow Email] Sent email "${subject}" to ${to}`);
      return true;
    } catch (err) {
      console.error(`[DriveNow Email Error] Failed to send email to ${to}:`, err);
      return false;
    }
  }

  // Graceful fallback when SMTP credentials are not yet configured in .env
  console.log(`[DriveNow Email Simulated/Preview] To: ${to} | Subject: "${subject}"`);
  return true;
}

export async function sendRideConfirmationEmail(to: string, rideData: any): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: auto;">
      <h2 style="color: #059669;">DriveNow Cab Booking Confirmed</h2>
      <p>Hi <strong>${rideData.customerName}</strong>,</p>
      <p>Your cab booking <strong>#${rideData.id}</strong> is confirmed!</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Cab:</strong> ${rideData.vehicleModel} (${rideData.vehicleRegNo})</p>
        <p style="margin: 4px 0;"><strong>Driver:</strong> ${rideData.driverName} (${rideData.driverPhone})</p>
        <p style="margin: 4px 0;"><strong>Ride Start OTP:</strong> <span style="font-size: 18px; font-weight: bold; color: #059669;">${rideData.otp}</span></p>
        <p style="margin: 4px 0;"><strong>Pickup:</strong> ${rideData.pickup?.address}</p>
        <p style="margin: 4px 0;"><strong>Drop:</strong> ${rideData.drop?.address}</p>
        <p style="margin: 4px 0;"><strong>Estimated Fare:</strong> ₹${rideData.fare?.totalFare}</p>
      </div>
      <p style="color: #64748b; font-size: 12px;">Share your 4-digit OTP with the driver only after boarding. Have a safe journey!</p>
    </div>
  `;
  return sendEmail(to, `DriveNow Booking Confirmed - #${rideData.id}`, html);
}

export async function sendPaymentReceiptEmail(to: string, paymentData: any): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: auto;">
      <h2 style="color: #059669;">DriveNow Payment Receipt</h2>
      <p>Hi <strong>${paymentData.customerName}</strong>,</p>
      <p>We received your payment of <strong>₹${paymentData.amount}</strong> for Ride <strong>#${paymentData.rideId}</strong>.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Invoice No:</strong> ${paymentData.invoiceNumber}</p>
        <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${paymentData.method}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">PAID</span></p>
        <p style="margin: 4px 0;"><strong>Amount Paid:</strong> ₹${paymentData.amount}</p>
      </div>
      <p style="color: #64748b; font-size: 12px;">Thank you for riding with DriveNow India.</p>
    </div>
  `;
  return sendEmail(to, `Payment Receipt - ${paymentData.invoiceNumber}`, html);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: auto;">
      <h2 style="color: #059669;">DriveNow Password Reset</h2>
      <p>You requested a password reset for your DriveNow account.</p>
      <p>Click the link below to set a new password (valid for 1 hour):</p>
      <p><a href="${resetUrl}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
      <p style="color: #64748b; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return sendEmail(to, 'DriveNow Password Reset Request', html);
}
