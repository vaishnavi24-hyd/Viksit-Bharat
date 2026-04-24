import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const query = message.toLowerCase();
  
  // Rule-based keyword matching
  // We return a translation key that the frontend will map to the actual localized string
  let responseKey = 'chatDefault';

  if (query.includes('complaint status') || query.includes('status')) {
    responseKey = 'botRepComplaintStatus';
  } else if (query.includes('report') || query.includes('issue') || query.includes('शिकायत') || query.includes('సమస్య')) {
    responseKey = 'botRepReport';
  } else if (query.includes('track') || query.includes('ट्रैक') || query.includes('ట్రాక్')) {
    responseKey = 'botRepTrack';
  } else if (query.includes('scheme') || query.includes('eligibility') || query.includes('योजना') || query.includes('పథకం')) {
    responseKey = 'botRepScheme';
  } else if (query.includes('register') || query.includes('sign up') || query.includes('पंजीकरण') || query.includes('నమోదు')) {
    responseKey = 'botRepLogin';
  } else if (query.includes('login') || query.includes('sign in') || query.includes('लॉगिन') || query.includes('లాగిన్')) {
    responseKey = 'botRepLogin';
  } else if (query.includes('location') || query.includes('gps') || query.includes('स्थान') || query.includes('స్థానం')) {
    responseKey = 'botRepLocation';
  } else if (query.includes('language') || query.includes('hindi') || query.includes('telugu') || query.includes('भाषा') || query.includes('భాష')) {
    responseKey = 'botRepLanguage';
  } else if (query.includes('voice') || query.includes('mic') || query.includes('speak') || query.includes('आवाज') || query.includes('వాయిస్')) {
    responseKey = 'botRepVoice';
  } else if (query.includes('community') || query.includes('forum') || query.includes('discuss') || query.includes('समुदाय') || query.includes('కమ్యూనిటీ')) {
    responseKey = 'botRepCommunity';
  } else if (query.includes('document') || query.includes('verify') || query.includes('दस्तावेज़') || query.includes('పత్రం')) {
    responseKey = 'botRepDocument';
  } else if (query.includes('hello') || query.includes('hi ') || query.includes('hey') || query.includes('नमस्ते') || query.includes('నమస్కారం')) {
    responseKey = 'chatGreeting';
  }

  // Future Ready: Here is where we would call the Gemini API eventually instead of the simple conditionals.

  return res.json({ replyKey: responseKey });
});

export default router;
