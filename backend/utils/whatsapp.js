const DEMO_MODE = true;

export const sendWhatsAppMessage = async (mobile, message) => {
  if (DEMO_MODE) {
    console.log(`\n========================================`);
    console.log(`📱 WHATSAPP MESSAGE SIMULATION (DEMO MODE)`);
    console.log(`📞 TO: +91 ${mobile}`);
    console.log(`💬 MESSAGE: Notification sent (Demo Mode)`);
    console.log(`========================================\n`);
    return true;
  }

  // TODO: Replace with Twilio API later
  console.log(`\n========================================`);
  console.log(`📱 WHATSAPP MESSAGE (REAL)`);
  console.log(`📞 TO: +91 ${mobile}`);
  console.log(`💬 MESSAGE: ${message}`);
  console.log(`========================================\n`);
  return true;
};
