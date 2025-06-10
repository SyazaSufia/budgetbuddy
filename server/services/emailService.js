const nodemailer = require('nodemailer');
require('dotenv').config();

// Multiple Hostinger SMTP configurations to try
const hostingerConfigs = [
  // Configuration 1: SSL on port 465
  {
    name: 'Hostinger SSL (465)',
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  // Configuration 2: TLS on port 587
  {
    name: 'Hostinger TLS (587)',
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  // Configuration 3: Alternative Hostinger SMTP
  {
    name: 'Hostinger Alt (587)',
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  },
  // Configuration 4: Using domain-specific SMTP
  {
    name: 'Domain SMTP (587)',
    host: 'smtp.budgetbuddy.space', // Try your domain
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  }
];

// Function to test SMTP configurations
const testSMTPConfig = async (config) => {
  console.log(`\n🔍 Testing ${config.name}...`);
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`User: ${config.auth.user}`);
  
  const transporter = nodemailer.createTransport(config);
  
  try {
    await transporter.verify();
    console.log(`✅ ${config.name} - Connection successful!`);
    return { success: true, transporter, config };
  } catch (error) {
    console.log(`❌ ${config.name} - Failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// Test all configurations and return the working one
const findWorkingConfig = async () => {
  console.log('🚀 Testing Hostinger email configurations...');
  console.log('📧 Email:', process.env.EMAIL_USER);
  console.log('🔑 Password length:', process.env.EMAIL_PASS?.length, 'characters');
  
  for (const config of hostingerConfigs) {
    const result = await testSMTPConfig(config);
    if (result.success) {
      return result;
    }
  }
  
  throw new Error('No working SMTP configuration found');
};

// Initialize transporter with working config
let transporter;
let activeConfig;

const initializeTransporter = async () => {
  try {
    const result = await findWorkingConfig();
    transporter = result.transporter;
    activeConfig = result.config;
    console.log(`\n✅ Using configuration: ${activeConfig.name}`);
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    throw error;
  }
};

// Dynamic base URL detection
const getBaseUrl = (req) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    return process.env.FRONTEND_URL_DEV || "http://localhost:43210";
  } else {
    return process.env.FRONTEND_URL_PROD || "https://budgetbuddy.space";
  }
};

// Function to send password reset email
const sendResetEmail = async (userEmail, resetToken, req) => {
  // Initialize transporter if not already done
  if (!transporter) {
    await initializeTransporter();
  }
  
  const baseUrl = getBaseUrl(req);
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: {
      name: 'Budget Buddy',
      address: process.env.EMAIL_USER
    },
    to: userEmail,
    subject: 'Password Reset Request - Budget Buddy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Budget Buddy</h1>
            <p style="color: #666; margin: 5px 0;">Your Personal Finance Companion</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #555; line-height: 1.6;">
            You have requested to reset your password for your Budget Buddy account. 
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
              Reset Your Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link in your browser:
          </p>
          <p style="word-break: break-all; color: #007bff; background-color: #f8f9fa; 
                    padding: 10px; border-radius: 5px; font-size: 14px;">
            ${resetLink}
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              If you didn't request this password reset, please ignore this email. 
              Your account remains secure.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 Budget Buddy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    console.log(`📧 Sending email using: ${activeConfig.name}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    console.log(`📧 To: ${userEmail}`);
    console.log(`🔗 Reset link: ${resetLink}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

// Manual test function - call this to test your email setup
const testEmailSetup = async () => {
  try {
    console.log('\n🧪 Testing email setup...');
    await initializeTransporter();
    
    // Test sending a simple email
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Budget Buddy Setup',
      text: 'If you receive this email, your SMTP configuration is working correctly!'
    };
    
    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return false;
  }
};

module.exports = {
  sendResetEmail,
  transporter,
  testEmailSetup,
  initializeTransporter
};