const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Bug 4: Guard against missing JWT_SECRET at startup, not silently at runtime
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    // Bug 3: validate email format before hitting the DB
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Please enter a valid email address' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Bug 1: never include passwordHash — return only safe fields
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    // Bug 5: log the real error for debugging
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    // Bug 2: explicitly select passwordHash — it has select:false in the schema
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Bug 1: return only safe fields, never the hash
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    // Bug 5: log the real error for debugging
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;