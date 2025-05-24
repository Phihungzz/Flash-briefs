const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  publishedAt: { type: Date },
  urlToImage: { type: String },
  savedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);
