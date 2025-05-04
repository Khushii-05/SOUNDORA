// routes/songRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const Song = require('../models/song');
const Playlist = require('../models/playlist');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route for song uploads page
router.get('/upload', isAuthenticated, (req, res) => {
  res.render('upload', { 
    user: req.user 
  });
});

// Handle song upload
router.post('/upload', isAuthenticated, upload.single('audio'), async (req, res) => {
  try {
    const audioUrl = req.file.path;
    const { title, artist, genre } = req.body;

    // Basic validation
    if (!title || !artist) {
      return res.status(400).render('upload', { 
        error: 'Title and artist are required',
        user: req.user
      });
    }

    // Save to MongoDB
    const newSong = new Song({
      title,
      artist,
      genre: genre || 'Unknown',
      audioUrl,
      uploadedBy: req.user._id
    });

    await newSong.save();
    res.redirect('/library');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).render('upload', { 
      error: 'Something went wrong during upload',
      user: req.user
    });
  }
});

// API endpoint for getting all songs
router.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }).limit(50);
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch songs' });
  }
});

// API endpoint for getting a specific song
router.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    res.json({ success: true, song });
  } catch (err) {
    console.error('Error fetching song:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch song' });
  }
});

// Search endpoint
router.get('/api/songs/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    
    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json({ success: true, songs });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});


module.exports = router;