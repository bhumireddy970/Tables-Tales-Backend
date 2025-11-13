// const express = require('express')
// const router = express.Router()
// const multer = require('multer')
// const Review = require('../models/review')
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Save the file in the "uploads" directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname); // Generate unique filename
//     }
// });

// const upload = multer({ storage });

// // API to handle review submission
// router.post('/', upload.single('image'), async (req, res) => {
//     const { rating, comment, foodRating, serviceRating, atmosphereRating, dateOfVisit, customerName } = req.body;
//     const image = req.file ? req.file.path : null; // Check if file exists

//     if (!rating || !comment || !foodRating || !serviceRating || !atmosphereRating || !dateOfVisit) {
//         return res.status(400).json({ message: 'Please fill in all fields before submitting the review.' });
//     }

//     try {
//         const newReview = new Review({
//             rating,
//             comment,
//             foodRating,
//             serviceRating,
//             atmosphereRating,
//             dateOfVisit,
//             customerName,
//             image,
//         });

//         await newReview.save();
//         res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
//     } catch (error) {
//         console.error('Error saving review: ', error);
//         res.status(500).json({ message: 'An error occurred while submitting your review.' });
//     }
// });

// router.get('/showreviews', async (req, res) => {
//     try {
//       const reviews = await Review.find();
//       res.status(200).json(reviews);
//     } catch (error) {
//       console.error('Error fetching reviews: ', error);
//       res.status(500).json({ message: 'An error occurred while fetching reviews.' });
//     }
//   });

// module.exports = router

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Review = require('../models/review');
const cloudinary = require('../config/cloudinary'); // your cloudinary config
const streamifier = require('streamifier');

// Use multer memory storage to get the file buffer instead of saving locally
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload buffer to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'reviews' }, // optional folder in Cloudinary
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// API to handle review submission
router.post('/', upload.single('image'), async (req, res) => {
  const { rating, comment, foodRating, serviceRating, atmosphereRating, dateOfVisit, customerName } = req.body;

  if (!rating || !comment || !foodRating || !serviceRating || !atmosphereRating || !dateOfVisit) {
    return res.status(400).json({ message: 'Please fill in all fields before submitting the review.' });
  }

  try {
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newReview = new Review({
      rating,
      comment,
      foodRating,
      serviceRating,
      atmosphereRating,
      dateOfVisit,
      customerName,
      image: imageUrl, // Save Cloudinary URL here
    });

    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'An error occurred while submitting your review.' });
  }
});

router.get('/showreviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'An error occurred while fetching reviews.' });
  }
});

module.exports = router;
