import express from 'express';
import Complaint from '../models/Complaint.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { type, description, latitude, longitude, status } = req.body;

    const newComplaint = new Complaint({
      userId: req.user.id,
      title: "Emergency SOS",
      description: description || "SOS triggered",
      type: type || "Emergency",
      priority: "High",
      status: status || "Submitted",
      latitude: latitude || null,
      longitude: longitude || null,
      address: "Emergency Location", // Required by model
      issueType: "Other" // Required to match enum if strictly validated, or just leave as is, model is not strictly requiring issueType
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({ message: "SOS sent successfully", complaint: savedComplaint });
  } catch (error) {
    console.error("SOS Error:", error);
    res.status(500).json({ error: "Failed to send SOS" });
  }
});

export default router;
