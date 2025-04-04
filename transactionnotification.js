const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendTransactionNotification = async (
    recipientEmail,
    recipientName,
    transactionType,
    amount,
    otherPartyName,
    transactionId,
    date,
    description
) => {
    const isDebit = transactionType === 'sent';
    
    const mailOptions = {
        from: {
            name: process.env.EMAIL_SENDER_NAME,
            address: process.env.EMAIL_USER
        },
        to: recipientEmail,
        subject: `E-PAY Transaction Alert - ${isDebit ? 'Debit' : 'Credit'}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
                    <!-- Header with Logo -->
                    <div style="background-color: #003366; color: white; padding: 30px 20px; text-align: center;">
                        <img src="https://your-logo-url.com/logo.png" alt="E-PAY" style="max-height: 50px; margin-bottom: 10px;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
                            ${isDebit ? '💸 Debit Alert' : '💰 Credit Alert'}
                        </h1>
                    </div>

                    <!-- Main Content -->
                    <div style="background-color: white; padding: 30px; border-radius: 8px; margin: 20px;">
                        <!-- Greeting -->
                        <p style="color: #444; font-size: 16px; margin-bottom: 25px;">
                            Dear <strong>${recipientName}</strong>,
                        </p>

                        <!-- Amount Box -->
                        <div style="
                            background-color: ${isDebit ? '#fff8f8' : '#f8fff8'}; 
                            border-left: 5px solid ${isDebit ? '#dc3545' : '#28a745'};
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 4px;
                            text-align: center;
                        ">
                            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                                ${isDebit ? 'Amount Debited' : 'Amount Credited'}
                            </p>
                            <h2 style="
                                color: ${isDebit ? '#dc3545' : '#28a745'}; 
                                margin: 0;
                                font-size: 32px;
                                font-weight: 600;
                            ">
                                ₦${amount.toLocaleString()}
                            </h2>
                        </div>

                        <!-- Transaction Details -->
                        <div style="
                            background-color: #f8f9fa;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 25px 0;
                        ">
                            <h3 style="color: #003366; margin: 0 0 15px 0; font-size: 18px;">
                                Transaction Details
                            </h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; color: #666; font-size: 14px;">Transaction ID</td>
                                    <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">
                                        ${transactionId}
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #eee;">
                                    <td style="padding: 12px 0; color: #666; font-size: 14px;">Description</td>
                                    <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">
                                        ${description}
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #eee;">
                                    <td style="padding: 12px 0; color: #666; font-size: 14px;">
                                        ${isDebit ? 'Transferred to' : 'Received from'}
                                    </td>
                                    <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">
                                        ${otherPartyName}
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #eee;">
                                    <td style="padding: 12px 0; color: #666; font-size: 14px;">Date & Time</td>
                                    <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">
                                        ${date}
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Security Notice -->
                        <div style="
                            background-color: #fff3cd;
                            border-left: 5px solid #ffd700;
                            padding: 15px;
                            margin: 25px 0;
                            border-radius: 4px;
                        ">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                🔒 <strong>Security Notice:</strong> If you did not authorize this transaction, 
                                please contact our support team immediately.
                            </p>
                        </div>

                        <!-- Contact Information -->
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                Need assistance? Contact us:
                            </p>
                            <p style="margin: 5px 0;">
                                <span style="color: #003366; margin: 0 10px;">
                                    📞 +234 123 456 7890
                                </span>
                                <span style="color: #003366; margin: 0 10px;">
                                    ✉️ support@epay.com
                                </span>
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                        <p style="margin: 5px 0;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                        <p style="margin: 5px 0;">
                            © ${new Date().getFullYear()} E-PAY. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Transaction notification sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending transaction notification:', error);
        return false;
    }
};

module.exports = { sendTransactionNotification };