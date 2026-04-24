import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  issueType: {
    type: String,
    enum: ['Roads & Potholes', 'Electricity & Power', 'Water & Sanitation', 'Garbage & Waste', 'Other'],
  },
  type: {
    type: String,
    default: 'Civic',
  },
  category: {
    type: String,
    enum: ['Fire', 'Accident', 'Electrical', 'Water Leakage', 'Other'],
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, // Base64 image
    default: null,
  },
  beforeImage: {
    type: String, // Base64 image
    default: null,
  },
  afterImage: {
    type: String, // Base64 image
    default: null,
  },
  status: {
    type: String,
    enum: ['Submitted', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  feedback: {
    type: String,
  },
  resolutionRemark: {
    type: String,
    default: null,
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  city: {
    type: String,
  },
  area: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Complaint', complaintSchema);
