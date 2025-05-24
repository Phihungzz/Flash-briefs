const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
}, { timestamps: true });


module.exports = mongoose.models.User || mongoose.model('User', userSchema);
