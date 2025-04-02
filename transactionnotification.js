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
    transactionType, // 'sent' or 'received'
    amount,
    otherPartyName,
    transactionId,
    date
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
                    <h1>${isDebit ? 'Debit' : 'Credit'} Transaction Alert</h1>
                </div>
                
                <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                    <p>Dear ${recipientName},</p>
                    
                    <div style="background-color: ${isDebit ? '#fff3cd' : '#d4edda'}; 
                               padding: 15px; margin: 20px 0; 
                               border-left: 4px solid ${isDebit ? '#ffd700' : '#28a745'}">
                        <p style="margin: 0;">Your account has been ${isDebit ? 'debited' : 'credited'} with:</p>
                        <h2 style="margin: 10px 0; color: ${isDebit ? '#dc3545' : '#28a745'}">
                            ₦${amount.toLocaleString()}
                        </h2>
                    </div>

                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <h3 style="margin-top: 0;">Transaction Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0;">Transaction ID:</td>
                                <td style="padding: 8px 0;"><strong>${transactionId}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">Type:</td>
                                <td style="padding: 8px 0;"><strong>${isDebit ? 'Debit' : 'Credit'}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">${isDebit ? 'Transferred to' : 'Received from'}:</td>
                                <td style="padding: 8px 0;"><strong>${otherPartyName}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">Date & Time:</td>
                                <td style="padding: 8px 0;"><strong>${date}</strong></td>
                            </tr>
                        </table>
                    </div>

                    <p style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #6c757d;">
                        If you did not authorize this transaction, please contact our support immediately:
                        <br>📞 +1234567890
                        <br>✉️ support@epay.com
                    </p>

                    <p style="margin-top: 30px;">Best regards,<br>E-PAY Team</p>
                </div>
                
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} E-PAY. All rights reserved.</p>
                </div>
            </div>
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