const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 

// Middleware for protected routes that require authentication 
const protect = async (req, res, next) => { 
    try { 
        let token = req.cookies.token;
        
        // Check if token exists 
        if (!token) { 
            console.log('No authentication token found'); 
            return res.redirect('/auth?error=Please login to access this page'); 
        } 
        
        try { 
            // Verify token 
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            
            // Get the full user object
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                console.log('User not found for ID:', decoded.id);
                res.clearCookie('token');
                return res.redirect('/auth?error=User not found. Please login again.');
            }
            
            // Set user in request 
            req.user = user;
            next(); 
        } catch (error) { 
            console.error('Token verification failed:', error); 
            res.clearCookie('token'); 
            return res.redirect('/auth?error=Your session has expired. Please login again.'); 
        } 
    } catch (error) { 
        console.error('Auth middleware error:', error); 
        return res.status(500).render('error', { 
            message: 'Server error during authentication', 
            status: 500 
        }); 
    } 
};

// Middleware for API routes that require authentication 
const isAuthenticated = async (req, res, next) => { 
    try { 
        let token; 
        
        // Get token from cookies 
        if (req.cookies.token) { 
            token = req.cookies.token; 
        } 
        
        // Check if token exists 
        if (!token) { 
            console.log('API auth failed: No token'); 
            return res.status(401).json({ success: false, message: 'Not authenticated' }); 
        } 
        
        try { 
            // Verify token 
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            console.log('API auth: Token verified for user ID:', decoded.id); 
            
            // Get user data without the password 
            const user = await User.findById(decoded.id).select('-password'); 
            
            if (!user) { 
                console.log('API auth failed: User not found'); 
                return res.status(401).json({ success: false, message: 'User not found' }); 
            } 
            
            // Set user in request 
            req.user = user; 
            next(); 
        } catch (error) { 
            console.error('API auth failed: Token verification error:', error); 
            return res.status(401).json({ success: false, message: 'Not authenticated' }); 
        } 
    } catch (error) { 
        console.error('API auth middleware error:', error); 
        return res.status(500).json({ success: false, message: 'Server error' }); 
    } 
}; 

module.exports = { protect, isAuthenticated };