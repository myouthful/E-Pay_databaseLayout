const sendLoginNotificationEmail = async (userEmail, firstName, loginTime) => {
    const mailOptions = {
        from: {
            name: process.env.EMAIL_SENDER_NAME,
            address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: 'New Login Detected - E-PAY Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
                    <h1>E-PAY Security Alert</h1>
                </div>
                
                <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                    <p>Dear ${firstName},</p>
                    
                    <p>We detected a new login to your E-PAY account.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #003366;">
                        <p><strong>Login Details:</strong></p>
                        <p>Date & Time: ${loginTime}</p>
                    </div>
                    
                    <p><strong>If this was you:</strong></p>
                    <p>No action is required. You can continue using your account normally.</p>
                    
                    <p><strong>If this wasn't you:</strong></p>
                    <ul>
                        <li>Change your password immediately</li>
                        <li>Contact our support team</li>
                        <li>Review your recent transactions</li>
                    </ul>
                    
                    <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffd700;">
                        For your security, we recommend:
                        <ul>
                            <li>Using a strong, unique password</li>
                            <li>Enabling two-factor authentication</li>
                            <li>Never sharing your login credentials</li>
                        </ul>
                    </p>
                    
                    <p>If you need assistance, contact us:</p>
                    <p>📞 Contact: +1234567890<br>
                    ✉️ Email: support@epay.com</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    The E-PAY Security Team</p>
                </div>
                
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
                    <p>This is an automated security notification. Please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} E-PAY. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Login notification email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending login notification email:', error);
        return false;
    }
};

module.exports = { sendLoginNotificationEmail };