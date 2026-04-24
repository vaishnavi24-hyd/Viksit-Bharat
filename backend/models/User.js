import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  occupation: {
    type: String,
    required: false,
  },
  preferredLanguage: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'official'],
    default: 'user',
  },
  citizenScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('User', userSchema);
