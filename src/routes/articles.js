const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const savedArticleSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  articleId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  urlToImage: { type: String },
  description: { type: String },
  author: { type: String },
  publishedAt: { type: Date },
  content: { type: String },
  savedAt: { type: Date, default: Date.now },
});
const SavedArticle = mongoose.models.SavedArticle || mongoose.model('SavedArticle', savedArticleSchema);

router.post('/saved', authMiddleware, async (req, res) => {
  const {
    articleId,
    title,
    url,
    urlToImage,
    description,
    author,
    publishedAt,
    content,
  } = req.body;

  if (!articleId || !title || !url) {
    return res.status(400).json({ error: 'Missing required fields: articleId, title or url' });
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
      url,
      urlToImage,
      description,
      author,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      content,
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
