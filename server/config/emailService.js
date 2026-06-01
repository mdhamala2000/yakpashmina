import nodemailer from 'nodemailer';

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true
  }
});

// Validate single email format
const validateSingleEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
};

// Validate array of emails
const validateEmails = (recipients) => {
    if (!recipients) return { valid: false, invalid: [] };
    const emailList = Array.isArray(recipients) ? recipients : [recipients];
    const valid = [];
    const invalid = [];
    
    emailList.forEach(email => {
        if (validateSingleEmail(email)) {
            valid.push(email);
        } else if (email) {
            invalid.push(email);
        }
    });
    
    return { valid, invalid };
};

// Sanitize email header to prevent header injection
const sanitizeInput = (input) => {
    if (!input) return '';
    return String(input)
        .replace(/[\r\n]/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();
};

// Function to send email with validation (supports array or single email)
async function sendEmail(to, subject, text, html, retryCount = 3) {
    // Handle both array and single email
    let recipients = Array.isArray(to) ? to : [to];
    
    // Validate all recipients
    const { valid, invalid } = validateEmails(recipients);
    
    if (valid.length === 0) {
        console.error('No valid email addresses:', invalid);
        return { success: false, error: 'No valid email addresses' };
    }
    
    if (invalid.length > 0) {
        console.warn('Invalid email addresses will be skipped:', invalid);
    }
    
    // Sanitize subject
    const safeSubject = sanitizeInput(subject);
    
    const mailOptions = {
        from: process.env.EMAIL,
        to: valid.join(', '),
        subject: safeSubject,
        text,
        html
    };
    
    let lastError;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${valid.length} recipient(s): ${info.messageId}`);
            return { success: true, messageId: info.messageId, sentTo: valid };
        } catch (error) {
            lastError = error;
            console.error(`Email attempt ${attempt} failed:`, error.message);
            if (attempt < retryCount) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    console.error(`Failed to send email after ${retryCount} attempts:`, lastError);
    return { success: false, error: lastError?.message || 'Unknown error' };
}

export { sendEmail };