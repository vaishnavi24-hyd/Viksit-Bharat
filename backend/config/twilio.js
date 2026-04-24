import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

let client;
try {
  client = twilio(accountSid, authToken);
  console.log('Twilio Client Initialized');
} catch (error) {
  console.error('Failed to initialize Twilio Client:', error.message);
}

export default client;
