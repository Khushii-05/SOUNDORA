const passport = require('passport'); 
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');

// Local Strategy for username/password login
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            // Find user by username
            const user = await User.findOne({ username });
            
            // If user doesn't exist
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            
            // Check if password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid password' });
            }
            
            // If all is well, return the user
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Google Strategy
passport.use(new GoogleStrategy({ 
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
    callbackURL: 'http://localhost:5000/auth/google/callback' 
}, async (accessToken, refreshToken, profile, done) => { 
    try { 
        const existingUser = await User.findOne({ email: profile.emails[0].value }); 
        
        if (existingUser) { 
            return done(null, existingUser); 
        } else { 
            const newUser = new User({ 
                fullName: profile.displayName, 
                username: profile.emails[0].value.split('@')[0], // simple username 
                email: profile.emails[0].value, 
                password: '',   // no password needed for Google OAuth users 
                profileImage: profile.photos[0]?.value 
            }); 
            
            await newUser.save(); 
            return done(null, newUser); 
        } 
    } catch (err) { 
        console.error('Google auth error:', err); 
        return done(err, null); 
    } 
})); 

// Serialize user to session 
passport.serializeUser((user, done) => { 
    done(null, user.id); 
}); 

// Deserialize user from session 
passport.deserializeUser(async (id, done) => { 
    try { 
        const user = await User.findById(id); 
        done(null, user); 
    } catch (err) { 
        done(err, null); 
    } 
}); 

module.exports = passport;