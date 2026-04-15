import { config } from '../config/env.js';

let twilioClient = null;

async function getClient() {
  if (twilioClient) return twilioClient;

  if (!config.twilio.accountSid || !config.twilio.authToken) {
    return null;
  }

  const twilio = await import('twilio');
  twilioClient = twilio.default(config.twilio.accountSid, config.twilio.authToken);
  return twilioClient;
}

export async function sendOtpSms(to, code) {
  const client = await getClient();

  if (!client) {
    console.log(`\n===== SMS OTP =====`);
    console.log(`To: ${to}`);
    console.log(`Code: ${code}`);
    console.log(`===================\n`);
    return { success: true, method: 'console' };
  }

  try {
    await client.messages.create({
      body: `DocConnect verification code: ${code}. Valid for 10 minutes.`,
      from: config.twilio.phoneNumber,
      to,
    });
    return { success: true, method: 'twilio' };
  } catch (err) {
    console.error('Twilio SMS error:', err.message);
    // Fallback to console
    console.log(`\n===== SMS OTP (Twilio failed) =====`);
    console.log(`To: ${to}`);
    console.log(`Code: ${code}`);
    console.log(`===================================\n`);
    return { success: true, method: 'console' };
  }
}
