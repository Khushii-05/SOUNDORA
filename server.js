require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

const userRoutes = require('./routes/userRoutes');
const { protect } = require('./middleware/authMiddleware');

// Express app initialization
const app = express();
app.use('/api/users', userRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB with improved error handling
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000, 
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Running in offline mode - database features will not work');
});

// Import models
const User = require('./models/User');
const Song = require('./models/song');
const Playlist = require('./models/playlist');

// Passport JWT Strategy
const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.token || null
    ]),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) return done(null, user);
        else return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            const username = profile.displayName.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
            user = new User({
                fullName: profile.displayName,
                username,
                email: profile.emails[0].value,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
                profileImage: profile.photos?.[0]?.value || ''
            });
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
    }
}));

// Initialize Passport
app.use(passport.initialize());

// Import routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const genreRoutes = require('./routes/genreRoutes');
const genreController = require('./controllers/genreController');

// Route registration
app.use('/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/', songRoutes);
app.use('/api/genres', genreRoutes);
app.get('/genres', genreController.getGenresPage);

// Helper function to get user from token
const getUserFromToken = async (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findById(decoded.id);
    } catch (err) {
        console.error("Error decoding token:", err);
        return null;
    }
};

// Public routes
app.get('/', (req, res) => res.render('landing'));
app.get('/auth', (req, res) => res.render('auth', { error: req.query.error, registered: req.query.registered }));

app.get('/about', async (req, res) => {
    try {
        const isAuthenticated = !!req.cookies.token;
        let playlists = [];
        if (isAuthenticated) {
            const user = await getUserFromToken(req.cookies.token);
            if (user) playlists = await Playlist.find({ user: user._id });
        }
        res.render('about', { user: isAuthenticated, playlists });
    } catch (err) {
        console.error('Error fetching playlists:', err);
        res.render('about', { user: !!req.cookies.token, playlists: [] });
    }
});

app.get('/home', async (req, res) => {
    try {
      const isAuthenticated = !!req.cookies.token;
      let playlists = [], songs = [], genres = [];
      
      if (isAuthenticated) {
        const user = await getUserFromToken(req.cookies.token);
        if (user) {
          playlists = await Playlist.find({ user: user._id });
          songs = await Song.find().sort({ createdAt: -1 }).limit(10);
          // Get unique genres
          genres = await Song.distinct('genre'); 
        }
      }
      
      res.render('index', { 
        user: isAuthenticated, 
        playlists, 
        songs,
        genres // Add genres to the template data
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      res.render('index', { 
        user: !!req.cookies.token, 
        playlists: [], 
        songs: [],
        genres: []
      });
    }
  });

// Add this route in server.js before other routes
app.get('/genres/:genreName', genreController.getGenreDetailPage);

// Make sure you have this mounting point for API routes
app.use('/api/genres', genreRoutes);

app.get('/music', async (req, res) => {
    try {
        const isAuthenticated = !!req.cookies.token;
        let playlists = [], songs = [];
        if (isAuthenticated) {
            const user = await getUserFromToken(req.cookies.token);
            if (user) {
                playlists = await Playlist.find({ user: user._id });
                songs = await Song.find().sort({ createdAt: -1 }).limit(10);
            }
        }
        res.render('music', { user: isAuthenticated, playlists, songs });
    } catch (err) {
        console.error('Error fetching playlists:', err);
        res.render('music', { user: !!req.cookies.token, playlists: [], songs: [] });
    }
});

// Replace the existing /library route with this:
app.get('/library', protect, async (req, res) => {
    try {
        const playlists = await Playlist.find({ user: req.user._id });
        const songs = await Song.find().sort({ createdAt: -1 }).limit(10);
        
        res.render('library', { 
            user: req.user,
            playlists: playlists,
            songs: songs
        });
    } catch (err) {
        console.error('Error loading library:', err);
        res.status(500).render('error', { 
            message: 'Failed to load library content',
            user: req.user 
        });
    }
});

app.get('/playlists/:id', protect, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('songs').exec();
        if (!playlist) return res.status(404).render('error', { message: 'Playlist not found' });
        if (playlist.user.toString() !== req.user.id.toString()) return res.status(403).render('error', { message: 'Not authorized' });
        const allPlaylists = await Playlist.find({ user: req.user.id });
        res.render('playlists', { user: true, playlist, playlists: allPlaylists });
    } catch (err) {
        console.error('Playlist error:', err);
        res.status(500).render('error', { message: 'Error loading playlist', status: 500 });
    }
});

// In server.js, update the LocalStrategy configuration:
passport.use(new LocalStrategy({ 
    usernameField: 'username', // Changed from 'email' to 'username'
    passwordField: 'password' 
}, async (username, password, done) => {
    try {
        const user = await User.findOne({ username }); // Find by username
        if (!user) return done(null, false, { message: 'Invalid username or password' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: 'Invalid username or password' });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

app.get('/profile', protect, async (req, res) => {
    try {
        const userData = await User.findById(req.user.id).select('-password');
        if (!userData) return res.status(404).render('error', { message: 'User not found', status: 404 });
        const playlists = await Playlist.find({ user: req.user.id });
        res.render('profile', { user: true, userData, playlists });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).render('error', { message: 'Server error', status: 500 });
    }
});

app.get('/privacy-policy', (req, res) => res.render('legal/privacy-policy'));
app.get('/terms-of-service', (req, res) => res.render('legal/terms-of-service'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
