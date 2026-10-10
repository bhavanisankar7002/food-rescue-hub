import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'zerowaste_super_secret_jwt_key_2026_evaluation',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, orgType, phone, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required fields.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      orgType: orgType || (role === 'donor' ? 'Restaurant' : 'Shelter'),
      phone: phone || '+91 98765 43210',
      address: address || '123 Metro Community Care Center',
    });

    await newUser.save();
    const token = signToken(newUser);

    res.status(201).json({
      message: 'Registration successful! Welcome to ZeroWaste.',
      token,
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = signToken(user);
    res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
