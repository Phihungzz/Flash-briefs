require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://flash-briefs.vercel.app' : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

const saltRounds = 10;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Phihung:123@cluster0.s6o0yeb.mongodb.net/flash_briefs?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});
const User = mongoose.model('User', userSchema);

const authRouter = require('./src/routes/auth');
const articlesRouter = require('./src/routes/articles');

app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);

module.exports = app;
