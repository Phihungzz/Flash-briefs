const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const savedArticleSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  articleId: { type: String, required: true },
  title: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
});
const SavedArticle = mongoose.model('SavedArticle', savedArticleSchema);

router.post('/saved', authMiddleware, async (req, res) => {
  const { title, articleId } = req.body;

  if (!title || !articleId) {
    return res.status(400).json({ error: 'Missing required fields: title or url' });
  }

  try {
    console.log('➡️ Save request by user:', req.user.email, 'title:', title);

    const existing = await SavedArticle.findOne({ userEmail: req.user.email, articleId });
    if (existing) {
      return res.status(409).json({ error: 'Article already saved' });
    }

    const article = new SavedArticle({
      userEmail: req.user.email,
      articleId,
      title,
      savedAt: new Date(),
    });

    await article.save();

    res.status(200).json({ message: 'Article saved successfully', savedArticle: article });
  } catch (error) {
    console.error('❌ Save article error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const articles = await SavedArticle.find({ userEmail: req.user.email });
    res.status(200).json({ savedArticles: articles });
  } catch (error) {
    console.error('❌ Get saved articles error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
