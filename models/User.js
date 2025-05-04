const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({ 
    fullName: String, 
    username: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    // New fields for enhanced profile functionality 
    bio: { type: String, default: '' }, 
    profileImage: { type: String, default: '' }, 
    createdAt: { type: Date, default: Date.now }, 
    playlists: { type: Number, default: 0 } 
}); 

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);