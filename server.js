require('dotenv').config(); // Load biến môi trường từ .env

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;

// Kết nối MongoDB, dùng biến môi trường MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Đ Defining user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});
const User = mongoose.model('User', userSchema);

// Import router articles
const articlesRouter = require('./src/routes/articles');

// --- Các route Auth ---
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Email and password are required');

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ email, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`User registered: ${email}`);

    res.status(200).json({ token, user: { email, role: user.role } });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Email and password are required');

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ email, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`User logged in: ${email}`);

    res.status(200).json({ token, user: { email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) throw new Error('User not found');

    console.log(`Token verified for user: ${user.email}`);
    res.status(200).json({ user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// Mount routes
app.use('/api/articles', articlesRouter);

// Export the app for Vercel
module.exports = app;
