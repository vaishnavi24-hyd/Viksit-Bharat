import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import twilioClient from '../config/twilio.js';

const router = express.Router();

const DEMO_MODE = true;

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }

    if (DEMO_MODE) {
      console.log(`Demo Mode: Bypassing Twilio OTP send for ${mobile}`);
      return res.json({ message: 'OTP sent successfully', status: 'approved', demo: true });
    }

    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!verifyServiceSid || !twilioClient) {
       console.error("Missing Twilio credentials or client not initialized.");
       return res.status(500).json({ error: 'Server configuration error for SMS.' });
    }

    const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;

    const verification = await twilioClient.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ 
        to: formattedMobile, 
        channel: 'sms'
      });

    console.log(`Twilio OTP sent to ${formattedMobile}. Status: ${verification.status}`);
    return res.json({ message: 'OTP sent successfully', status: verification.status });

  } catch (error) {
    console.error('Twilio Send OTP Error:', error);
    
    if (error.code === 21608 || (error.message && error.message.toLowerCase().includes('unverified'))) {
      return res.status(400).json({ 
        success: false, 
        error: "This number is not verified. Please use a registered number in demo mode." 
      });
    }

    return res.status(500).json({ error: error.message || 'Failed to send OTP via Twilio' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile and OTP required' });
    }

    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;

    // Verify OTP using Twilio
    if (DEMO_MODE) {
      if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid demo OTP' });
      }
      console.log(`Demo Mode: Bypassing Twilio OTP verify for ${mobile}`);
    } else {
      const verificationCheck = await twilioClient.verify.v2.services(verifyServiceSid)
        .verificationChecks
        .create({ to: formattedMobile, code: otp });

      if (verificationCheck.status !== 'approved') {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    }

    const rawMobile = formattedMobile.replace('+91', '');
    
    // Check if user exists
    let user = await User.findOne({ mobile: rawMobile });
    
    if (!user) {
      let assignedRole = 'user';
      if (DEMO_MODE) {
        if (rawMobile === '9999999999') assignedRole = 'admin';
        else if (rawMobile === '8888888888') assignedRole = 'official';
      }
      user = new User({ mobile: rawMobile, role: assignedRole });
      await user.save();
    }
    
    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_viksit_bharat', { expiresIn: '7d' });
    return res.json({ success: true, token, phone: user.mobile, role: user.role, user });

  } catch (error) {
    console.error('Twilio Verify OTP Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during verification' });
  }
});

export default router;
