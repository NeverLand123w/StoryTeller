import mongoose from 'mongoose';

// src/models/Story.js
const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  genre: { type: String, default: "Novel" },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  contentType: { type: String, enum: ['text', 'pdf'], default: 'text' },
  
  // 🟢 Make content and pdfData NOT required
  content: { type: String, default: null }, 
  pdfData: { type: String, default: null },
  thumbnail: { type: String, default: null },
  views: { type: Number, default: 0 }
});
export default mongoose.models.Story || mongoose.model('Story', storySchema);