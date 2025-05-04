// routes/playlistRoutes.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const Song = require('../models/song');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Get all playlists for the current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });
    res.render('library', { 
      playlists, 
      user: req.user,
      selectedPlaylist: null,
      songs: [] // We'll load songs separately
    });
  } catch (error) {
    console.error('Error getting playlists:', error);
    res.status(500).render('error', { message: 'Failed to load playlists' });
  }
});

// Get a specific playlist with its songs
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs')
      .exec();
    
    if (!playlist) {
      return res.status(404).render('error', { message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('error', { message: 'Not authorized' });
    }
    
    // Get all playlists for sidebar navigation
    const playlists = await Playlist.find({ user: req.user._id });
    
    res.render('library', {
      user: req.user,
      playlists: playlists,
      selectedPlaylist: playlist,
      songs: [] // We're showing playlist songs, so we don't need the general song list
    });
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).render('error', { message: 'Failed to load playlist' });
  }
});

// Create a new playlist
router.post('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Creating playlist, request body:', req.body);
    const { name } = req.body;
    
    if (!name) {
      console.log('Missing playlist name');
      return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }
    
    console.log('User creating playlist:', req.user.username);
    console.log('User ID:', req.user._id);
    
    const newPlaylist = new Playlist({
      name,
      user: req.user._id,
      songs: []
    });
    
    console.log('New playlist object created:', newPlaylist);
    
    const savedPlaylist = await newPlaylist.save();
    console.log('Playlist saved successfully:', savedPlaylist);
    
    // Update the user's playlist count
    await User.findByIdAndUpdate(req.user._id, { $inc: { playlists: 1 } });
    
    // Handle both API and form submissions
    if (req.headers['content-type'] === 'application/json') {
      return res.json({ success: true, playlist: savedPlaylist });
    } else {
      return res.redirect('/library');
    }
  } catch (error) {
    console.error('Error creating playlist:', error);
    
    // Handle both API and form submissions
    if (req.headers['content-type'] === 'application/json') {
      return res.status(500).json({ success: false, message: 'Failed to create playlist: ' + error.message });
    } else {
      return res.render('error', { message: 'Failed to create playlist: ' + error.message });
    }
  }
});

// Add a song to a playlist
router.post('/:id/songs', isAuthenticated, async (req, res) => {
  try {
    const { songId, source = 'local' } = req.body;
    const playlistId = req.params.id;
    
    let song;
    
    // Different handling based on source
    if (source === 'deezer') {
      // Check if the song already exists in our database
      song = await Song.findOne({ externalId: songId, externalSource: 'deezer' });
      
      if (!song) {
        return res.status(404).json({ 
          success: false, 
          message: 'Song not found. Please add the song to your library first.' 
        });
      }
    } else {
      // Regular song from our database
      song = await Song.findById(songId);
      
      if (!song) {
        return res.status(404).json({ success: false, message: 'Song not found' });
      }
    }
    
    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Check if song is already in playlist
    if (playlist.songs.includes(song._id)) {
      return res.status(400).json({ success: false, message: 'Song already in playlist' });
    }
    
    // Add song to playlist
    playlist.songs.push(song._id);
    await playlist.save();
    
    res.json({ 
      success: true, 
      message: 'Song added to playlist',
      songId: song._id
    });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove a song from a playlist
router.delete('/:id/songs/:songId', isAuthenticated, async (req, res) => {
  try {
    const { id, songId } = req.params;
    
    // Find the playlist
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Check if song is in the playlist
    const songIndex = playlist.songs.findIndex(song => song.toString() === songId);
    
    if (songIndex === -1) {
      return res.status(404).json({ success: false, message: 'Song not found in playlist' });
    }
    
    // Remove the song from the playlist
    playlist.songs.splice(songIndex, 1);
    await playlist.save();
    
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a playlist
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await Playlist.findByIdAndDelete(req.params.id);
    
    // Update the user's playlist count
    await User.findByIdAndUpdate(req.user._id, { $inc: { playlists: -1 } });
    
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;