// Add to your project models folder: src/models/Chapter.js
import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  title: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
  content: { type: String, default: null }, // Encrypted Text
  pdfData: { type: String, default: null }, // Encrypted PDF Base64
  contentType: { type: String, enum: ['text', 'pdf'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);