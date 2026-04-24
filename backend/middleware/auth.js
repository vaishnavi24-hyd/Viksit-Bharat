import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, authorization denied.' });
    }
    
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_viksit_bharat');
    req.user = verified.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token verification failed, authorization denied.' });
  }
};
