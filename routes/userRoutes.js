const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user stats
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            followers: user.followers || 0,
            following: user.following || 0,
            playlists: user.playlists || 0
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update profile
// userRoutes.js
router.put('/profile', protect, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const user = await User.findById(req.user.id);
        
        // Check if email is being changed
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        user.fullName = fullName;
        user.email = email;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' }); // Ensure JSON response
    }
});
// Change password
router.put('/password', protect, async (req, res) => { // Changed endpoint
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete account
router.delete('/', protect, async (req, res) => { // Changed endpoint
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Password is incorrect' });
        }

        await User.findByIdAndDelete(req.user.id);
        res.clearCookie('token');
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;