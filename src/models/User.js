import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "reader" },

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
    history: [{
      storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
      highlights: [String], // Storing the text content of the highlights
      lastRead: { type: Date, default: Date.now }
    }],

    preferences: {
      fontSize: { type: Number, default: 18 },
      viewMode: { type: String, default: 'single' },
      scale: { type: Number, default: 1.1 }
    },
    interactions: [{
      storyId: String,
      highlights: [{
        markId: String,
        color: String,
        segments: [{ xpath: String, start: Number, end: Number }]
      }]
    }],

    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },

    followerWriters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followedWriters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
