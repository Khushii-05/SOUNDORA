// utils/mixGenerator.js
const Song = require('../models/song');

const generateDailyMixes = async (userId) => {
  try {
    const DAILY_MIX_COUNT = 4;
    const SONGS_PER_MIX = 10;
    
    const totalSongs = await Song.countDocuments();
    if (totalSongs === 0) return [];

    return await Promise.all(
      Array.from({ length: DAILY_MIX_COUNT }).map(async (_, i) => {
        const songs = await Song.aggregate([
          { $sample: { size: SONGS_PER_MIX } },
          { $project: { title: 1, artist: 1, audioUrl: 1, genre: 1 } }
        ]);

        return {
          name: `Made for You Mix ${i + 1}`,
          description: songs[0]?.genre ? 
            `A mix of ${songs[0].genre} tracks you'll love` : 
            'Curated just for you',
          songs,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
      })
    );
  } catch (err) {
    console.error('Mix generation error:', err);
    return [];
  }
};

module.exports = { generateDailyMixes };