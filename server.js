require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Load model
const User = require('./src/models/User');

// Load middleware
const { authMiddleware, adminMiddleware } = require('./src/middleware/auth');

// Load routers
const articlesRouter = require('./src/routes/articles');
const usersRouter = require('./src/routes/users');

// 🔐 Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Email and password are required');

    const existing = await User.findOne({ email });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ email, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`✅ User registered: ${email}`);

    res.status(200).json({ token, user: { email, role: user.role } });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Email and password are required');

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ email, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({ token, user: { email, role: user.role } });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new Error('User not found');
    res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Verify error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter); 

module.exports = app;
