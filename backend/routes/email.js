const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../database');

const router = express.Router();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send summary via email
router.post('/send', async (req, res) => {
  try {
    const { summaryId, recipientEmails, subject, message } = req.body;

    if (!summaryId || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'summaryId and recipientEmails array are required'
      });
    }

    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: 'Email service not configured',
        message: 'Email credentials are not set in environment variables'
      });
    }

    // Get summary from database
    const getSummary = () => {
      return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
          SELECT * FROM summaries WHERE id = ?
        `);

        stmt.get([summaryId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });

        stmt.finalize();
      });
    };

    const summary = await getSummary();

    if (!summary) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'No summary found with the provided ID'
      });
    }

    // Create email content
    const emailSubject = subject || `Meeting Summary - ${new Date().toLocaleDateString()}`;
    const emailMessage = message || 'Please find the meeting summary attached below.';
    
    const finalSummary = summary.edited_summary || summary.generated_summary;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Meeting Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .summary-text { white-space: pre-wrap; background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 Meeting Summary</h2>
            <p><strong>Generated on:</strong> ${new Date(summary.created_at).toLocaleString()}</p>
            <p><strong>Custom Instructions:</strong> ${summary.custom_prompt}</p>
          </div>
          
          <div class="content">
            <h3>Summary:</h3>
            <div class="summary-text">${finalSummary}</div>
          </div>
          
          <div class="footer">
            <p>This summary was generated using MeetSynth</p>
            <p>Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Meeting Summary

Generated on: ${new Date(summary.created_at).toLocaleString()}
Custom Instructions: ${summary.custom_prompt}

Summary:
${finalSummary}

---
This summary was generated using AI Meeting Summarizer
Sent on: ${new Date().toLocaleString()}
    `;

    // Create transporter and send emails
    const transporter = createTransporter();
    
    const emailPromises = recipientEmails.map(async (email) => {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: emailSubject,
          text: textContent,
          html: htmlContent,
        };

        const result = await transporter.sendMail(mailOptions);
        return { email, success: true, messageId: result.messageId };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(result => result.success);
    const failedEmails = emailResults.filter(result => !result.success);

    // Log email sending to database
    const logEmailSending = () => {
      return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
          INSERT INTO email_logs (summary_id, recipient_emails, status)
          VALUES (?, ?, ?)
        `);

        const status = failedEmails.length === 0 ? 'sent' : 'partial';
        const allEmails = recipientEmails.join(', ');

        stmt.run([summaryId, allEmails, status], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });

        stmt.finalize();
      });
    };

    await logEmailSending();

    // Prepare response
    const response = {
      success: true,
      message: 'Email sending completed',
      summary: {
        id: summaryId,
        totalRecipients: recipientEmails.length,
        successfulSends: successfulEmails.length,
        failedSends: failedEmails.length
      },
      results: emailResults
    };

    if (failedEmails.length > 0) {
      response.warnings = `Some emails failed to send: ${failedEmails.map(r => r.email).join(', ')}`;
    }

    res.json(response);

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      error: 'Email service error',
      message: error.message || 'Failed to send emails'
    });
  }
});

// Get email logs for a summary
router.get('/logs/:summaryId', (req, res) => {
  try {
    const { summaryId } = req.params;

    const stmt = db.prepare(`
      SELECT * FROM email_logs WHERE summary_id = ? ORDER BY sent_at DESC
    `);

    stmt.all([summaryId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to retrieve email logs'
        });
      }

      res.json({
        success: true,
        emailLogs: rows,
        count: rows.length
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to retrieve email logs'
    });
  }
});

// Test email configuration
router.post('/test', async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing test email',
        message: 'testEmail is required'
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: 'Email service not configured',
        message: 'Email credentials are not set in environment variables'
      });
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'AI Meeting Summarizer - Test Email',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: '<h2>✅ Email Configuration Test</h2><p>This is a test email to verify your email configuration is working correctly.</p>'
    };

    const result = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Email test failed',
      message: error.message || 'Failed to send test email'
    });
  }
});

module.exports = router;
