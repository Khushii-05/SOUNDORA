// routes/songRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const Song = require('../models/song');
const Playlist = require('../models/playlist');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { generateDailyMixes } = require('../utils/mixGenerator');


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
router.get('/daily-mixes', isAuthenticated, async (req, res) => {  // <-- Add isAuthenticated
  try {
    const DAILY_MIX_COUNT = 4;
    const SONGS_PER_MIX = 10;
    
    const totalSongs = await Song.countDocuments();
    if (totalSongs === 0) {
      return res.json({ 
        success: true, 
        mixes: [],
        userName: req.user.fullName  // <-- Add this
      });
    }

    const mixes = await Promise.all(
      Array.from({ length: DAILY_MIX_COUNT }).map(async (_, i) => {
        const songs = await Song.aggregate([
          { $match: { audioUrl: { $exists: true } }},
          { $sample: { size: SONGS_PER_MIX } },
          {
            $project: {
              _id: 1,
              title: 1,
              artist: 1,
              audioUrl: 1,
              genre: 1
            }
          }
        ]);

        return {
          name: `Daily Mix ${i + 1}`,
          description: songs.length > 0 ? 
            `Your daily mix of ${songs[0]?.genre || 'various'} music` : 
            'Mix of popular tracks',
          songs: songs,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
      })
    );

    res.json({ success: true, mixes , userName: req.user.fullName });
  } catch (err) {
    console.error('Daily mixes error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load daily mixes',
      error: err.message
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
// Modify your daily mixes route like this:
// routes/songRoutes.js
// routes/songRoutes.js - Fixed route

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
module.exports = router;