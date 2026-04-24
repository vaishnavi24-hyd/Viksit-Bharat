import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Government', 'Investment', 'Private', 'Welfare'], required: true },
  category: { type: String, required: true },
  benefits: [{ type: String }],
  description: { type: String, required: true },
  eligibilityDetails: [{ type: String }],
  officialLink: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Scheme', schema);
