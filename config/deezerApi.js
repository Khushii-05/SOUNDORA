

const axios = require('axios');

const deezerApi = axios.create({
  baseURL: 'https://api.deezer.com',
  timeout: 10000
});

// Search for tracks
const searchTracks = async (query, limit = 20) => {
  try {
    const response = await deezerApi.get(`/search`, {
      params: {
        q: query,
        limit: limit
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching Deezer tracks:', error);
    throw new Error('Failed to search tracks');
  }
};

// Get track details
const getTrack = async (trackId) => {
  try {
    const response = await deezerApi.get(`/track/${trackId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting Deezer track:', error);
    throw new Error('Failed to get track details');
  }
};

// Get artist details
const getArtist = async (artistId) => {
  try {
    const response = await deezerApi.get(`/artist/${artistId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting Deezer artist:', error);
    throw new Error('Failed to get artist details');
  }
};

module.exports = {
  searchTracks,
  getTrack,
  getArtist
};