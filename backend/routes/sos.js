import express from "express";
import Complaint from "../models/Complaint.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🚨 SOS ROUTE
router.post("/", async (req, res) => {
  try {
    console.log("🚨 SOS HIT BACKEND");
    console.log("BODY:", req.body);

    const {
      description,
      latitude,
      longitude,
      issueType,
      address
    } = req.body;

    let userId = null;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (token && token !== "undefined" && token !== "null") {
      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "super_secret_jwt_key_for_viksit_bharat");
        userId = verified.user.id;
      } catch (err) {
        console.warn("SOS: Invalid token, proceeding as anonymous", err.message);
      }
    }

    const complaintData = {
      title: "SOS Emergency",
      description: description || "SOS triggered",
      type: "Emergency",
      issueType: issueType || "Other",
      priority: "High",
      status: "Submitted",
      latitude,
      longitude,
      address: address || "Emergency Location"
    };

    if (userId) {
      complaintData.userId = userId;
    }

    const complaint = new Complaint(complaintData);

    const saved = await complaint.save();

    res.status(201).json({
      message: "SOS created successfully",
      complaint: saved
    });

  } catch (err) {
    console.error("❌ SOS ERROR:", err);
    res.status(500).json({ error: "SOS failed" });
  }
});

export default router;