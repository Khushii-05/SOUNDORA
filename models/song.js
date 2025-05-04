// models/song.js
const mongoose = require('mongoose');


const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  // For your own uploaded content
  audioUrl: {
    type: String
  },
  // For external API references
  externalId: {
    type: String
  },
  externalSource: {
    type: String,
    enum: ['deezer', 'local', 'other'],
    default: 'local'
  },
  previewUrl: {
    type: String
  },
  albumCover: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', songSchema);