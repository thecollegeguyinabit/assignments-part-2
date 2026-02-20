import nodemailer from "nodemailer";


// Generate a test account
  const testAccount = await nodemailer.createTestAccount();

  console.log("Test account created:");
  console.log("  User: %s", testAccount.user);
  console.log("  Pass: %s", testAccount.pass);

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

export async function sendTestEmail(senderEmail, name) {
  
  try {
  // Send a test message
  const info = await transporter.sendMail({
    from: `"Test App" <${testAccount.user}>`,
    to: senderEmail,
    subject: "Welcome Email from Expense Manager",
    html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0d6efd; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Welcome to Expense Manager!</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
            <h2>Hello ${name},</h2>
            <p>Thank you for signing up! Your account has been created successfully.</p>
            <h3>What you can do:</h3>
            <ul>
              <li>Track income and expenses</li>
              <li>Create multiple accounts</li>
              <li>Share accounts with other users</li>
              <li>Categorize your transactions</li>
            </ul>
            <p>Start managing your finances today!</p>
            <p style="color: #6c757d; font-size: 14px;">— The Expense Manager Team</p>
          </div>
        </div>
    `,
  });

  console.log("Message sent: %s %s", info.messageId, senderEmail);
  console.log("Preview: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}

