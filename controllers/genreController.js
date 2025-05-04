// controllers/genreController.js
const Song = require('../models/song');
const Playlist = require('../models/playlist');
const User = require('../models/User');

// Render the genres page with enhanced functionality
exports.getGenresPage = async (req, res) => {
  try {
    const isAuthenticated = req.cookies.token ? true : false;
    let playlists = [];
    let user = null;
    let genrePlaylists = [];
    
    if (isAuthenticated) {
      // Get user from token
      user = await getUserFromToken(req.cookies.token);
      if (user) {
        // Get all playlists for the user
        playlists = await Playlist.find({ user: user._id });
        
        // Filter out genre-specific playlists for special display
        genrePlaylists = playlists.filter(playlist => 
          playlist.name.includes(' Mix') || 
          playlist.name.includes(' Hits') || 
          playlist.name.includes(' Vibes')
        );
      }
    }
    
    // Get all songs
    const songs = await Song.find().sort({ title: 1 });
    
    // Group songs by genre
    const genreGroups = {};
    songs.forEach(song => {
      if (!song.genre) return; // Skip songs without genre
      
      if (!genreGroups[song.genre]) {
        genreGroups[song.genre] = [];
      }
      genreGroups[song.genre].push(song);
    });
    
    res.render('genres', {
      user: isAuthenticated ? user : null,
      playlists: playlists,
      genrePlaylists: genrePlaylists,
      genreGroups: genreGroups
    });
  } catch (error) {
    console.error('Error rendering genres page:', error);
    res.status(500).render('error', { message: 'Error loading genres' });
  }
};

// In genreController.js, update getGenreDetailPage
exports.getGenreDetailPage = async (req, res) => {
  try {
    const genreName = req.params.genreName.replace(/-/g, ' '); // Convert hyphens to spaces
    const songs = await Song.find({ 
      genre: { $regex: new RegExp(`^${genreName}$`, 'i') } 
    });

    res.render('genre-detail', {
      genre: genreName,
      songs: songs,
      user: req.user // Make sure you pass user data if needed
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { message: 'Error loading genre' });
  }
};

const sanitizeGenre = (genre) => {
  return genre.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase();
};
// Helper function to get user from token
const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

module.exports = exports;