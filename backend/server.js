import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { auth } from './middleware/auth.js';
import { isAdmin, isOfficial, isAdminOrOfficial } from './middleware/roleAuth.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Scheme from './models/Scheme.js';
import { Post, Reply } from './models/Post.js';
import { sendWhatsAppMessage } from './utils/whatsapp.js';
import { seedDatabase } from './utils/seeder.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/authRoutes.js';
import sosRoutes from './routes/sos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mock DB for OTP storage
const otpStorage = new Map();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viksit_bharat')
  .then(async () => {
  console.log('MongoDB connection established successfully');
  await seedDatabase();
}).catch(err => console.error('MongoDB connection error:', err));

// --- Chat Routes ---
app.use('/api/chat', chatRoutes);

// --- Auth Routes ---
app.use('/api/auth', authRoutes);

// --- SOS Route ---
app.use('/api/sos', sosRoutes);

// 3. Register New User
app.post('/api/register', async (req, res) => {
  try {
    const { mobile, name, age, location, occupation, preferredLanguage } = req.body;
    
    let existingUser = await User.findOne({ mobile });
    if (existingUser && existingUser.name) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    let savedUser;
    if (existingUser) {
      existingUser.name = name;
      existingUser.age = age;
      existingUser.location = location;
      existingUser.occupation = occupation;
      existingUser.preferredLanguage = preferredLanguage;
      savedUser = await existingUser.save();
    } else {
      const newUser = new User({ mobile, name, age, location, occupation, preferredLanguage, role: 'user' });
      savedUser = await newUser.save();
    }
    
    // Simulate WhatsApp Notification
    await sendWhatsAppMessage(mobile, `Welcome to Viksit Bharat! Your account has been created successfully.`);
    
    // Generate Token
    const token = jwt.sign({ user: { id: savedUser._id } }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_viksit_bharat', { expiresIn: '7d' });
    
    return res.status(201).json({ token, user: savedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Current User (Protected via middleware)
app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      age: user.age,
      location: user.location,
      occupation: user.occupation,
      preferredLanguage: user.preferredLanguage,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4b. Get Leaderboard
app.get('/api/leaderboard', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .sort({ citizenScore: -1 })
      .select('name location citizenScore')
      .lean();
      
    // Assign rank dynamically
    const rankedUsers = users.map((u, index) => ({
      ...u,
      rank: index + 1
    }));
    
    res.json(rankedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Complaint Routes ---

// 5. Create Complaint
app.post('/api/complaints', auth, async (req, res) => {
  try {
    const { title, issueType, description, image, latitude, longitude, address, state, district, city, area } = req.body;
    
    if (!title || !issueType || !description || !address) {
      return res.status(400).json({ error: 'Title, issue type, description, and address are required' });
    }
    
    const newComplaint = new Complaint({
      userId: req.user.id,
      title,
      issueType,
      description,
      image: image,
      latitude,
      longitude,
      address,
      state,
      district,
      city,
      area
    });
    
    const savedComplaint = await newComplaint.save();
    
    // Incremental Score Update: +10 for creating a complaint
    await User.findByIdAndUpdate(req.user.id, { $inc: { citizenScore: 10 } });
    
    // Simulate WhatsApp Notification
    const user = await User.findById(req.user.id);
    if (user) {
      await sendWhatsAppMessage(user.mobile, `Your complaint has been registered successfully. ID: ${savedComplaint._id}`);
    }
    
    res.status(201).json(savedComplaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get All Complaints
app.get('/api/complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6b. Get User Complaints
app.get('/api/complaints/user', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update Complaint Status (Admin/Testing)
app.put('/api/complaints/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status, afterImage, resolutionRemark } = req.body;
    const validStatuses = ['Submitted', 'In Progress', 'Resolved', 'Closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Build update object
    const updateKeys = { status };
    if (afterImage !== undefined) updateKeys.afterImage = afterImage;
    if (resolutionRemark !== undefined) updateKeys.resolutionRemark = resolutionRemark;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateKeys,
      { new: true }
    );
    
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    
    // Incremental Score Update: +20 for resolving a complaint
    if (status === 'Resolved') {
      await User.findByIdAndUpdate(complaint.userId, { $inc: { citizenScore: 20 } });
    }
    
    // Simulate WhatsApp Notification
    const user = await User.findById(complaint.userId);
    if (user) {
      let msg = `Your complaint ${complaint._id} status is now ${status}.`;
      if (afterImage && status === 'Resolved') msg += ' An after-image has been attached as proof!';
      await sendWhatsAppMessage(user.mobile, msg);
    }
    
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7b. Submit Feedback
app.put('/api/complaints/:id/feedback', auth, async (req, res) => {
  try {
    const { feedback } = req.body;
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.status !== 'Resolved') return res.status(400).json({ error: 'Can only leave feedback on resolved complaints' });
    
    complaint.feedback = feedback;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Check Schemes API (Eligibility Gate)
app.post('/api/check-schemes', auth, async (req, res) => {
  try {
    const { income, gender, age, occupation, casteCategory, state, area, familyStatus } = req.body;
    // Log variables naturally in backend, then match across MongoDB (fetching all natively for demo simulation)
    const schemes = await Scheme.find({});
    
    // Simulate WhatsApp Notification based on active form submission mapping
    const user = await User.findById(req.user.id);
    if (user) {
      await sendWhatsAppMessage(user.mobile, `Your eligibility check is complete! Found ${schemes.length} matching welfare/investment schemas for ${area} ${casteCategory} citizens in ${state}.`);
    }
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get All Schemes
app.get('/api/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find({});
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Get Specific Scheme by ID
app.get('/api/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Community Forum Routes ---

// 11. Create Post
app.post('/api/posts', auth, async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    
    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Title, description, category, and location are required' });
    }
    
    const newPost = new Post({
      userId: req.user.id,
      title,
      description,
      category,
      location
    });
    
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Get All Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'name location');
    
    // We also need to get reply counts for each post
    const postsWithDetails = await Promise.all(posts.map(async (post) => {
      const replyCount = await Reply.countDocuments({ postId: post._id });
      return {
        ...post.toObject(),
        username: post.userId?.name || 'Anonymous',
        userLocation: post.userId?.location || post.location,
        replyCount
      };
    }));
    
    res.json(postsWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Get Single Post with Replies
app.get('/api/posts/:id', async (req, res) => {
  try {
    // Increment views
    const post = await Post.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'name location');
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const replies = await Reply.find({ postId: post._id })
      .sort({ createdAt: 1 })
      .populate('userId', 'name');
      
    const formattedReplies = replies.map(r => ({
      ...r.toObject(),
      username: r.userId?.name || 'Anonymous'
    }));
    
    res.json({
      ...post.toObject(),
      username: post.userId?.name || 'Anonymous',
      userLocation: post.userId?.location || post.location,
      replies: formattedReplies
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Add Reply
app.post('/api/posts/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const newReply = new Reply({
      postId: post._id,
      userId: req.user.id,
      message
    });
    
    const savedReply = await newReply.save();
    
    // Populate user info for immediate display
    await savedReply.populate('userId', 'name');
    
    res.status(201).json({
      ...savedReply.toObject(),
      username: savedReply.userId?.name || 'Anonymous'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin APIs ---
app.get('/api/admin/complaints', auth, isAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).populate('userId', 'name mobile');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/complaints/:id/priority', auth, isAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { priority: req.body.priority }, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/complaints/:id/close', auth, isAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    
    if (complaint.feedback !== 'Yes') {
      return res.status(400).json({ error: 'Cannot close unless feedback is Yes' });
    }
    complaint.status = 'Closed';
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/insights', auth, isAdmin, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: { $in: ['Submitted', 'In Progress'] } });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$issueType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostCommonCategory = categoryStats.length ? categoryStats[0]._id : 'N/A';
    
    res.json({
      totalComplaints: total,
      pendingComplaints: pending,
      resolvedComplaints: resolved,
      mostCommonCategory,
      topArea: 'Mumbai' // Hardcoded for simplified demo, typically another aggregate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Official APIs ---

app.get('/api/official/emergencies', auth, isOfficial, async (req, res) => {
  try {
    const emergencies = await Complaint.find({ type: 'Emergency' }).sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/official/insights', auth, isOfficial, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });
    const resolutionRate = total > 0 ? (((resolved + closed) / total) * 100).toFixed(1) : 0;
    
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$issueType', count: { $sum: 1 } } }
    ]);
    
    const areaStats = await Complaint.aggregate([
      { $group: { _id: '$address', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      totalComplaints: total,
      complaintsByCategory: categoryStats.map(c => ({ category: c._id, count: c.count })),
      complaintsByArea: areaStats.map(a => ({ area: a._id, count: a.count })),
      resolutionRate: `${resolutionRate}%`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/official/complaints', auth, isOfficial, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const loc = user.location || '';
    
    let query = {};
    if (loc) {
      query = {
        $or: [
          { state: loc },
          { district: loc },
          { city: loc },
          { address: { $regex: loc, $options: 'i' } }
        ]
      };
    }
    
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Analytics APIs ---
app.get('/api/analytics/categories', auth, isAdminOrOfficial, async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$issueType', name: { $first: '$issueType' }, value: { $sum: 1 } } }
    ]);
    res.json(data.filter(d => d.name));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/analytics/areas', auth, isAdminOrOfficial, async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$address', name: { $first: '$address' }, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 7 }
    ]);
    res.json(data.filter(d => d.name));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/analytics/trends', auth, isAdminOrOfficial, async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          date: { $first: { $dateToString: { format: "%m/%d", date: "$createdAt" } } },
          complaints: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
