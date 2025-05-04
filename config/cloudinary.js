const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "soundora_songs",
    resource_type: "video", // needed for mp3/mp4
    allowed_formats: ["mp3"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
