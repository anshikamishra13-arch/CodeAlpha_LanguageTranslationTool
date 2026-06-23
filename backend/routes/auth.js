const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Guard against missing JWT_SECRET at startup
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

// POST /api/auth/register
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail)
      return res.status(409).json({ error: 'Email already registered' });

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(409).json({ error: 'Phone number already registered' });

    // Hash password with salt rounds
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      phone,
      passwordHash,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Return safe user data (no password hash)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('Register error:', {
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ error: `${field} already exists` });
    }

    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password hash (it has select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Return safe user data (no password hash)
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /api/auth/verify (optional endpoint to verify token)
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;