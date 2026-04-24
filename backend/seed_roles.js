import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viksit_bharat')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Set all existing users to ordinary
    await User.updateMany({}, { role: 'user' });

    // Ensure 9999999999 is admin
    await User.findOneAndUpdate(
      { mobile: '9999999999' },
      { mobile: '9999999999', role: 'admin', name: 'System Admin', age: 35, location: 'Delhi', occupation: 'Admin', preferredLanguage: 'en' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Ensure 8888888888 is official
    await User.findOneAndUpdate(
      { mobile: '8888888888' },
      { mobile: '8888888888', role: 'official', name: 'Govt Official', age: 40, location: 'Mumbai', occupation: 'Official', preferredLanguage: 'en' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Ensure 7777777777 is user
    await User.findOneAndUpdate(
       { mobile: '7777777777' },
       { mobile: '7777777777', role: 'user', name: 'Citizen Demo', age: 25, location: 'Pune', occupation: 'Student', preferredLanguage: 'en' },
       { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Roles seeded successfully for 9999999999 (admin), 8888888888 (official), 7777777777 (user).');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
