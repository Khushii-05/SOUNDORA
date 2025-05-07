const express = require('express'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const passport = require('passport'); 
const User = require('../models/User'); 

const router = express.Router(); 

// Signup 
router.post('/signup', async (req, res) => { 
    const { firstName, lastName, username, email, password } = req.body; 
    
    try { 
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        }); 
        
        if (existingUser) { 
            if (existingUser.email === email) { 
                return res.status(400).json({ error: 'Email already in use' }); 
            } 
            if (existingUser.username === username) { 
                return res.status(400).json({ error: 'Username already taken' }); 
            } 
        } 
        
        const hashedPassword = await bcrypt.hash(password, 10); 
        const fullName = `${firstName} ${lastName}`.trim(); 
        
        const newUser = new User({ 
            fullName, 
            username, 
            email, 
            password: hashedPassword 
        }); 
        
        await newUser.save(); 
        
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); 
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000
        }); 
        
        if (req.headers['content-type'] === 'application/json') { 
            return res.status(201).json({ message: 'User registered successfully' }); 
        } else { 
            return res.redirect('/home'); 
        } 
    } catch (err) { 
        console.error('Signup error:', err); 
        
        if (req.headers['content-type'] === 'application/json') { 
            return res.status(500).json({ error: 'Signup failed', details: err.message }); 
        } else { 
            return res.redirect('/auth?error=signup'); 
        } 
    } 
}); 

// Login route - Updated to handle both API and form submissions
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            
            if (req.headers['content-type'] === 'application/json') {
                return res.status(500).json({ error: 'Login failed', details: err.message });
            } else {
                return res.redirect('/auth?error=login');
            }
        }
        
        if (!user) {
            if (req.headers['content-type'] === 'application/json') {
                return res.status(400).json({ error: info.message || 'Authentication failed' });
            } else {
                return res.redirect('/auth?error=authentication');
            }
        }
        
        // User authenticated, create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production
            sameSite: 'None', // Required for cross-origin cookies
            maxAge: 24 * 60 * 60 * 1000
        });
        
        if (req.headers['content-type'] === 'application/json') {
            return res.json({ message: 'Login successful', token });
        } else {
            return res.redirect('/home');
        }
    })(req, res, next);
});
// Logout 
router.post('/logout', (req, res) => { 
    res.clearCookie('token'); 
    res.redirect('/'); 
}); 

// GOOGLE AUTH ROUTES 
// Redirect to Google for authentication 
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false 
})); 

// Google callback URL 
router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: '/auth?error=google_login' 
    }), 
    async (req, res) => { 
        try { 
            // On successful authentication, create JWT token 
            const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); 

            // Set token in HttpOnly cookie 
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 24 * 60 * 60 * 1000 // 1 day 
            }); 

            res.redirect('/home'); 
        } catch (err) { 
            console.error('Google callback error:', err); 
            res.redirect('/auth?error=google_callback'); 
        } 
    } 
); 

module.exports = router;