const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // không trả về password
    res.json({ users }); // trả về object có key users chứa mảng user
  } catch (error) {
    console.error('Fetch users error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
