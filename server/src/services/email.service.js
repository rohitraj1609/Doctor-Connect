import { Resend } from 'resend';
import { config } from '../config/env.js';

let resend = null;

function getResend() {
  if (resend) return resend;
  if (!config.resendApiKey) {
    console.warn('Resend API key not configured. Emails will be logged to console.');
    return null;
  }
  resend = new Resend(config.resendApiKey);
  return resend;
}

export async function sendOtpEmail(to, code) {
  const r = getResend();

  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">DocConnect</h2>
      <p>Your verification code is:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;

  if (!r) {
    console.log(`\n===== EMAIL OTP =====`);
    console.log(`To: ${to}`);
    console.log(`Code: ${code}`);
    console.log(`=====================\n`);
    return { success: true, method: 'console' };
  }

  try {
    const { data, error } = await r.emails.send({
      from: 'DocConnect <onboarding@resend.dev>',
      to,
      subject: 'DocConnect - Verification Code',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      // Fallback to console
      console.log(`\n===== EMAIL OTP (Resend failed) =====`);
      console.log(`To: ${to}`);
      console.log(`Code: ${code}`);
      console.log(`=====================================\n`);
      return { success: true, method: 'console' };
    }

    console.log(`Email sent to ${to} (id: ${data?.id})`);
    return { success: true, method: 'resend' };
  } catch (err) {
    console.error('Email send error:', err.message);
    console.log(`\n===== EMAIL OTP (error fallback) =====`);
    console.log(`To: ${to}`);
    console.log(`Code: ${code}`);
    console.log(`======================================\n`);
    return { success: true, method: 'console' };
  }
}

export async function sendAppointmentEmail(to, subject, body) {
  const r = getResend();

  if (!r) {
    console.log(`\n===== EMAIL =====`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`=================\n`);
    return;
  }

  try {
    await r.emails.send({
      from: 'DocConnect <onboarding@resend.dev>',
      to,
      subject,
      html: body,
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
}
