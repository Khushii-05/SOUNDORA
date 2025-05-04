// routes/deezerRoutes.js
const express = require('express');
const router = express.Router();
const deezerApi = require('../config/deezerApi');
const Song = require('../models/song');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Search Deezer API
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const tracks = await deezerApi.searchTracks(query);
    
    // Format the response
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      duration: track.duration,
      previewUrl: track.preview,
      albumCover: track.album.cover_medium,
      externalSource: 'deezer'
    }));
    
    res.json({ success: true, songs: formattedTracks });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Error searching for songs' });
  }
});

// Add Deezer track to database (use this when adding to playlist)
router.post('/add-to-library', isAuthenticated, async (req, res) => {
  try {
    const { trackId } = req.body;
    
    // Check if song already exists in the database
    const existingSong = await Song.findOne({ 
      externalId: trackId.toString(),
      externalSource: 'deezer'
    });
    
    if (existingSong) {
      return res.json({ success: true, song: existingSong });
    }
    
    // Get track details from Deezer
    const track = await deezerApi.getTrack(trackId);
    
    // Create new song entry
    const newSong = new Song({
      title: track.title,
      artist: track.artist.name,
      genre: track.genre_id ? track.genre_id.toString() : 'Unknown',
      externalId: track.id.toString(),
      externalSource: 'deezer',
      previewUrl: track.preview,
      albumCover: track.album.cover_medium
    });
    
    await newSong.save();
    
    res.json({ success: true, song: newSong });
  } catch (error) {
    console.error('Error adding track to library:', error);
    res.status(500).json({ success: false, message: 'Error adding track to library' });
  }
});

module.exports = router;