// routes/genreRoutes.js
const express = require('express');
const router = express.Router();
const Song = require('../models/song');
const Playlist = require('../models/playlist');
const genreController = require('../controllers/genreController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the genres page
router.get('/', genreController.getGenresPage);

// Render a specific genre page
router.get('/:genreName', genreController.getGenreDetailPage);

// Get all available genres from songs in the database
router.get('/api/all', isAuthenticated, async (req, res) => {
  try {
    // Find all unique genres from the songs collection
    const genres = await Song.distinct('genre');
    
    res.json({ success: true, genres });
  } catch (error) {
    console.error('Error getting genres:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create genre-based playlists for the user with improved naming and organization
router.post('/api/create-genre-playlists', isAuthenticated, async (req, res) => {
  try {
    // Get all unique genres
    const genres = await Song.distinct('genre');
    const createdPlaylists = [];
    
    // For each genre, create a playlist if it doesn't exist
    for (const genre of genres) {
      if (!genre) continue; // Skip empty genres
      
      // Check if user already has a playlist for this genre
      const existingPlaylist = await Playlist.findOne({ 
        user: req.user._id,
        name: `${genre} Mix` // Name format for genre playlists
      });
      
      if (!existingPlaylist) {
        // Find all songs with this genre
        const genreSongs = await Song.find({ genre });
        
        // Create a new playlist
        const newPlaylist = new Playlist({
          name: `${genre} Mix`,
          user: req.user._id,
          songs: genreSongs.map(song => song._id)
        });
        
        await newPlaylist.save();
        createdPlaylists.push(newPlaylist);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Created ${createdPlaylists.length} genre playlists`,
      playlists: createdPlaylists
    });
  } catch (error) {
    console.error('Error creating genre playlists:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get songs by genre
router.get('/api/songs/:genreName', isAuthenticated, async (req, res) => {
  try {
    const { genreName } = req.params;
    const songs = await Song.find({ 
      genre: { $regex: new RegExp(genreName, 'i') } 
    }).sort({ title: 1 });
    
    res.json({ success: true, genre: genreName, songs });
  } catch (error) {
    console.error('Error getting songs by genre:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recommended songs from similar genres
router.get('/api/recommendations/:genreName', isAuthenticated, async (req, res) => {
  try {
    const { genreName } = req.params;
    
    // Create a mapping of related genres
    const genreRelations = {
      'Rock': ['Alternative', 'Metal', 'Punk', 'Indie'],
      'Pop': ['Dance', 'R&B', 'K-Pop', 'Electronic'],
      'Hip Hop': ['Rap', 'R&B', 'Urban'],
      'Electronic': ['Dance', 'EDM', 'House', 'Techno'],
      'R&B': ['Soul', 'Hip Hop', 'Pop'],
      'Jazz': ['Blues', 'Soul', 'Funk'],
      'Classical': ['Orchestral', 'Piano', 'Opera'],
      'Country': ['Folk', 'Americana'],
      'Reggae': ['Dancehall', 'Ska'],
      // Add more mappings as needed
    };
    
    // Get related genres
    const relatedGenres = genreRelations[genreName] || [];
    
    // Find songs from related genres, limit to 10
    const recommendedSongs = await Song.find({
      genre: { $in: relatedGenres },
      // Exclude songs from the current genre
      _id: { $nin: (await Song.find({ genre: genreName })).map(s => s._id) }
    }).limit(10);
    
    res.json({ success: true, recommendations: recommendedSongs });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;