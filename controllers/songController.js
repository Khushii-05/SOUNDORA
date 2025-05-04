// controllers/songController.js
const Song = require('../models/song');
const User = require('../models/User');
const Playlist = require('../models/playlist');

// Get all songs
exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }).limit(50);
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get song by ID
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new song
exports.createSong = async (req, res) => {
  try {
    const { title, artist, genre, audioUrl } = req.body;
    
    // Basic validation
    if (!title || !artist || !audioUrl) {
      return res.status(400).json({ message: 'Title, artist and audio URL are required' });
    }
    
    const song = new Song({
      title,
      artist,
      genre: genre || 'Unknown',
      audioUrl
    });
    
    await song.save();
    res.status(201).json(song);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update song
exports.updateSong = async (req, res) => {
  try {
    const { title, artist, genre, audioUrl } = req.body;
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { title, artist, genre, audioUrl },
      { new: true }
    );
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(song);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete song
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Also remove this song from all playlists
    await Playlist.updateMany(
      { songs: req.params.id },
      { $pull: { songs: req.params.id } }
    );
    
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// SEARCH SONGS - Implementing the missing search endpoint
exports.searchSongs = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search in title, artist and genre fields
    const songs = await Song.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { artist: { $regex: searchQuery, $options: 'i' } },
        { genre: { $regex: searchQuery, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json({ songs });
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ message: 'Error searching songs' });
  }
};

// Get songs by genre
exports.getSongsByGenre = async (req, res) => {
  try {
    const genre = req.params.genre;
    const songs = await Song.find({ genre: { $regex: genre, $options: 'i' } });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs by genre:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;