const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Article = require('../models/Article');
const User = require('../models/User');

const router = express.Router();

// POST /api/articles/save
router.post('/save', authMiddleware, async (req, res) => {
  const { title, url, publishedAt, urlToImage } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: 'Missing required fields: title or url' });
  }

  try {
    console.log('➡️ Save request by user:', req.user); 

    const existing = await Article.findOne({ userId: req.user.id, url });
    if (existing) {
      return res.status(409).json({ message: 'Article already saved' });
    }

    const article = new Article({
      userId: req.user.id,
      title,
      url,
      publishedAt,
      urlToImage,
    });

    await article.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { savedArticles: article._id } });

    res.json({ message: 'Article saved', article });
  } catch (error) {
    console.error('❌ Save article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/articles/saved
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const articles = await Article.find({ userId: req.user.id });
    res.json(articles);
  } catch (error) {
    console.error('❌ Get saved articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/articles/all-saved
router.get('/all-saved', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const articles = await Article.find().populate('userId', 'email');
    res.json(articles);
  } catch (error) {
    console.error('❌ Get all saved articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
