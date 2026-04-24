import User from '../models/User.js';

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error while checking role' });
  }
};

export const isOfficial = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'official') {
      return res.status(403).json({ error: 'Access denied. Official role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error while checking role' });
  }
};

export const isAdminOrOfficial = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'official')) {
      return res.status(403).json({ error: 'Access denied. Admin or Official role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error while checking role' });
  }
};
