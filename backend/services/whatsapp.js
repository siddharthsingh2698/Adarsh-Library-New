// WhatsApp notifications via Twilio WhatsApp API
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in .env
// TWILIO_WHATSAPP_FROM format: whatsapp:+14155238886 (Twilio sandbox number)

const sendWhatsApp = async (to, message) => {
  const sid  = process.env.TWILIO_ACCOUNT_SID;
  const auth = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!sid || !auth) {
    console.log(`[WhatsApp SKIP — no Twilio creds] To: ${to} | ${message}`);
    return { skipped: true };
  }

  // Normalize number: strip non-digits, add +91 if Indian number without country code
  let normalized = to.replace(/\D/g, '');
  if (normalized.length === 10) normalized = '91' + normalized;
  const toNumber = `whatsapp:+${normalized}`;

  try {
    const client = require('twilio')(sid, auth);
    const msg = await client.messages.create({ from, to: toNumber, body: message });
    console.log(`[WhatsApp SENT] ${toNumber} | SID: ${msg.sid}`);
    return { sent: true, sid: msg.sid };
  } catch (err) {
    console.error(`[WhatsApp ERROR] ${toNumber} | ${err.message}`);
    return { error: err.message };
  }
};

module.exports = { sendWhatsApp };
