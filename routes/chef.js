const express = require('express');
const multer = require('multer');
const stream = require('stream');
const Chef = require('../models/chef');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Route to add a chef with image upload to Cloudinary
router.post('/addchef', upload.single('image'), async (req, res) => {
    const { name, description, experience, speciality, rating } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
    }

    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'chefs' },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Image upload failed', error: error.message });
                }

                const imageURL = result.secure_url;

                const newChef = new Chef({
                    name,
                    description,
                    experience,
                    speciality,
                    rating,
                    imageURL,
                });

                await newChef.save();
                res.status(201).json({ message: 'Chef added successfully', chef: newChef });
            }
        );

        bufferStream.pipe(uploadStream);
    } catch (error) {
        console.error('Error adding chef:', error);
        res.status(500).json({ message: 'Error adding chef', error: error.message });
    }
});

// ✅ Route to get all chefs
router.get('/showchefs', async (req, res) => {
    try {
        const chefs = await Chef.find({});
        if (!chefs || chefs.length === 0) {
            return res.status(404).json({ message: 'No chefs found.' });
        }
        return res.status(200).json({ chef: chefs });
    } catch (err) {
        console.error('Error fetching chefs:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
