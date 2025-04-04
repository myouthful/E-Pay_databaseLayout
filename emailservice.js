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
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
                    <!-- Header with Logo -->
                    <div style="background: linear-gradient(135deg, #003366 0%, #004080 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Welcome to E-PAY 🎉</h1>
                        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your Digital Banking Journey Begins</p>
                    </div>

                    <!-- Main Content -->
                    <div style="background-color: white; padding: 30px; border-radius: 10px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <!-- Greeting -->
                        <p style="color: #444; font-size: 16px; margin-bottom: 25px;">
                            Dear <strong style="color: #003366;">${firstName}</strong>,
                        </p>

                        <p style="color: #666; line-height: 1.6;">
                            Welcome to the E-PAY family! 🌟 We're excited to have you join us on this journey towards smarter banking.
                        </p>

                        <!-- Account Details Box -->
                        <div style="
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                            border-left: 5px solid #003366;
                            padding: 20px;
                            margin: 25px 0;
                            border-radius: 8px;
                        ">
                            <h3 style="color: #003366; margin: 0 0 15px 0;">Your Account Details 🔐</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Account Number:</td>
                                    <td style="padding: 8px 0; color: #003366; font-weight: 600; text-align: right;">
                                        ${accountNumber}
                                    </td>
                                </tr>
                                <tr style="border-top: 1px dashed #ddd;">
                                    <td style="padding: 8px 0; color: #666;">Initial Password:</td>
                                    <td style="padding: 8px 0; color: #003366; font-weight: 600; text-align: right;">
                                        ${password}
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Test Mode Notice -->
                        <div style="
                            background-color: #fff3cd;
                            border-left: 5px solid #ffd700;
                            padding: 15px;
                            margin: 25px 0;
                            border-radius: 8px;
                        ">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                <strong>🔔 Important Notice:</strong> While we are in test mode, the default password for 
                                transferring funds is <strong>4444</strong>. This is temporary and will be changed upon full launch.
                            </p>
                        </div>

                        <!-- Security Notice -->
                        <div style="
                            background-color: #e8f4fd;
                            border-left: 5px solid #0dcaf0;
                            padding: 20px;
                            margin: 25px 0;
                            border-radius: 8px;
                        ">
                            <h3 style="color: #003366; margin: 0 0 15px 0;">Security First! 🛡️</h3>
                            <ul style="
                                color: #666;
                                margin: 0;
                                padding-left: 20px;
                                list-style-type: none;
                            ">
                                <li style="margin: 10px 0;">✅ Change your password upon first login</li>
                                <li style="margin: 10px 0;">✅ Never share your credentials</li>
                                <li style="margin: 10px 0;">✅ Enable two-factor authentication</li>
                                <li style="margin: 10px 0;">✅ Monitor your account regularly</li>
                            </ul>
                        </div>

                        <!-- Getting Started Steps -->
                        <div style="margin: 30px 0;">
                            <h3 style="color: #003366; margin: 0 0 15px 0;">Quick Start Guide 🚀</h3>
                            <ol style="
                                color: #666;
                                margin: 0;
                                padding-left: 20px;
                                line-height: 1.6;
                            ">
                                <li>Download our mobile banking app</li>
                                <li>Log in with your account number and password</li>
                                <li>Set up your security preferences</li>
                                <li>Start enjoying our digital banking services</li>
                            </ol>
                        </div>

                        <!-- Contact Information -->
                        <div style="
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                        ">
                            <p style="color: #666; margin: 5px 0;">
                                Need help? We're here for you 24/7
                            </p>
                            <div style="margin: 15px 0;">
                                <span style="
                                    display: inline-block;
                                    margin: 5px 10px;
                                    padding: 8px 15px;
                                    background-color: #f8f9fa;
                                    border-radius: 20px;
                                    color: #003366;
                                ">
                                    📞 +234 123 456 7890
                                </span>
                                <span style="
                                    display: inline-block;
                                    margin: 5px 10px;
                                    padding: 8px 15px;
                                    background-color: #f8f9fa;
                                    border-radius: 20px;
                                    color: #003366;
                                ">
                                    ✉️ support@epay.com
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 10px; margin: 20px;">
                        <p style="color: #666; font-size: 12px; margin: 5px 0;">
                            This is an automated message. Please do not reply.
                        </p>
                        <p style="color: #666; font-size: 12px; margin: 5px 0;">
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
        console.log('Welcome email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

module.exports = { sendWelcomeEmail };