import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

// Function to convert markdown-style text to HTML
function formatSummaryHTML(summary, senderName, senderEmail) {
  let html = summary
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert main bullets (* text) to proper list items
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    // Convert sub-bullets (    * text) to nested list items
    .replace(/^    \* (.*$)/gm, '<ul><li>$1</li></ul>')
    // Convert line breaks to <br> for remaining text
    .replace(/\n/g, '<br>');

  // Wrap consecutive <li> items in <ul> tags
  html = html.replace(/(<li>.*?<\/li>)(?:\s*<br>\s*)?(?=<li>|$)/gs, '<ul>$1</ul>');
  
  // Clean up nested <ul> tags and extra <br> tags
  html = html.replace(/<\/ul>\s*<br>\s*<ul>/g, '');
  html = html.replace(/<br>\s*<ul>/g, '<ul>');
  html = html.replace(/<\/ul>\s*<br>/g, '</ul>');

  // Create sender info section
  const senderInfo = (senderName || senderEmail) ? `
    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
      <div style="display: flex; align-items: center; color: #1565c0;">
        <span style="font-size: 18px; margin-right: 8px;">👤</span>
        <div>
          <strong style="font-size: 14px;">Shared by:</strong>
          <div style="font-size: 16px; margin-top: 2px;">
            ${senderName || 'Someone'}${senderEmail ? ` <span style="color: #666; font-size: 14px;">(${senderEmail})</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  ` : '';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 5px; font-size: 28px;">📋 Meeting Summary</h1>
        <p style="color: #7f8c8d; margin: 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${senderInfo}
      
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <div style="color: #2c3e50; line-height: 1.8; font-size: 15px;">
          ${html}
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
        <p style="color: #6c757d; margin: 0; font-size: 13px;">
          📧 This summary was generated automatically by Meeting Summary App<br>
          <span style="color: #adb5bd;">If you have questions about this content, please contact the sender.</span>
        </p>
      </div>
    </div>
  `;
}

function parseRecipients(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(s => s.trim()).filter(Boolean);
  return input.toString().split(/[,|\n|;]/).map(s => s.trim()).filter(Boolean);
}

router.post("/", async (req, res) => {
  try {
    const { summary, recipients, senderName, senderEmail } = req.body;
    if (!summary || !recipients) return res.status(400).json({ error: "summary and recipients are required" });

    const toList = parseRecipients(recipients);
    if (!toList.length) return res.status(400).json({ error: "No valid recipient emails" });

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!toList.every(email => emailRegex.test(email))) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    // Validate sender email if provided
    if (senderEmail && !emailRegex.test(senderEmail)) {
      return res.status(400).json({ error: "Invalid sender email format" });
    }

    // Gmail-specific transporter configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail service
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Additional Gmail-specific settings
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({ 
        error: "Email server authentication failed", 
        details: "Check your SMTP credentials" 
      });
    }

    const mailOptions = {
      from: `"Meeting Summary App" <${process.env.SMTP_USER}>`, // Your app's email
      to: toList.join(","),
      subject: senderName ? `Meeting Summary (shared by ${senderName})` : "Meeting Summary",
      text: `${senderName || senderEmail ? `Shared by: ${senderName || 'Someone'} ${senderEmail ? `(${senderEmail})` : ''}\n\n` : ''}${summary}`,
      html: formatSummaryHTML(summary, senderName, senderEmail),
    };

    console.log('Sending email to:', toList);
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      return res.json({ 
        success: true, 
        messageId: info.messageId,
        recipients: toList.length 
      });
    } catch (sendError) {
      console.error('Email sending failed:', sendError);
      return res.status(500).json({ 
        error: "Failed to send email", 
        details: sendError.message 
      });
    }
  } catch (err) {
    console.error("Share error:", err);
    
    // More specific error messages
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      return res.status(401).json({ 
        error: "Email authentication failed", 
        details: "Check your Gmail credentials and App Password" 
      });
    }
    
    return res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;