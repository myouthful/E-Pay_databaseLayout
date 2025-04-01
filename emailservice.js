const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendWelcomeEmail = async (userEmail, firstName, accountNumber, password) => {
    const mailOptions = {
        from: {
            name: process.env.EMAIL_SENDER_NAME,
            address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: 'Welcome to E-PAY - Your Account Details',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
                    <h1>Welcome to E-PAY</h1>
                </div>
                
                <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                    <p>Dear ${firstName},</p>
                    
                    <p>Welcome to E-PAY! We're thrilled to have you join our banking family. Your account has been successfully created.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #003366;">
                        <p><strong>Your Account Details:</strong></p>
                        <p>Account Number: <strong>${accountNumber}</strong></p>
                        <p>Initial Password: <strong>${password}</strong></p>
                    </div>
                    
                    <p><strong>Important Security Notice:</strong></p>
                    <ul>
                        <li>Please change your password upon your first login</li>
                        <li>Never share your password with anyone</li>
                        <li>Enable two-factor authentication for added security</li>
                    </ul>
                    
                    <p><strong>Getting Started:</strong></p>
                    <ol>
                        <li>Download our mobile banking app</li>
                        <li>Log in with your account number and password</li>
                        <li>Set up your security preferences</li>
                        <li>Start enjoying our digital banking services</li>
                    </ol>
                    
                    <p>If you have any questions or need assistance, our customer support team is available 24/7:</p>
                    <p>📞 Contact: +1234567890<br>
                    ✉️ Email: support@epay.com</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    The E-PAY Team</p>
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
        console.log('Welcome email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

module.exports = { sendWelcomeEmail };