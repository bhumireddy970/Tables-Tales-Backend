// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs')
// const Item = require('../models/item');
// const router = express.Router();

// // Set up storage for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Create 'uploads' folder if it doesn't exist
//     const uploadDir = path.join(__dirname, '../uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir); // Directory where images will be stored
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique filename using the timestamp and file extension
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// // Initialize multer with the storage configuration
// const upload = multer({ storage });

// // Route to add an item (including image)
// router.post('/addItem', upload.single('image'), async (req, res) => {
//   const { name, category, price, description } = req.body;
  
//   // Check if the image is uploaded
//   if (!req.file) {
//     return res.status(400).json({ message: 'Image is required' });
//   }

//   const imageURL = `/uploads/${req.file.filename}`; // Construct the image URL

//   try {
//     const newItem = new Item({
//       name,
//       category,
//       price,
//       description,
//       imageURL, // Store the image URL
//     });

//     await newItem.save();
//     res.status(201).json({ message: 'Item added successfully', item: newItem });
//   } catch (error) {
//     console.error('Error adding item:', error);
//     res.status(500).json({ message: 'Error adding item', error });
//   }
// });

// module.exports = router;


const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // import your cloudinary config
const Item = require('../models/item');
const router = express.Router();

// Use multer memory storage to get file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addItem', upload.single('image'), async (req, res) => {
  const { name, category, price, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  try {
    // Upload image buffer to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant_items', // optional folder name in Cloudinary
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Image upload failed', error });
        }

        // Create new Item with Cloudinary URL
        const newItem = new Item({
          name,
          category,
          price,
          description,
          imageURL: result.secure_url,
        });

        await newItem.save();
        return res.status(201).json({ message: 'Item added successfully', item: newItem });
      }
    );

    // Pipe the buffer into upload_stream
    const stream = cloudinary.uploader.upload_stream;
    const bufferStream = require('stream').Readable.from(req.file.buffer);
    bufferStream.pipe(result);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Error adding item', error });
  }
});

module.exports = router;
