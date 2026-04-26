import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  title: {
    type: String,
    required: true,
  },

  issueType: {
    type: String,
    default: "Other", // 🔥 REMOVE ENUM PROBLEM
  },

  type: {
    type: String,
    default: 'Standard',
  },

  category: {
    type: String,
  },

  description: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['Submitted', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted',
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },

  latitude: Number,
  longitude: Number,

  address: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Complaint', complaintSchema);