const Item = require('../models/item')
const multer = require('multer')
const fs = require('fs')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

async function addItem(req, res) {
  const { name, price, description, imageURL } = req.body;
  try {
    const newItem = new Item({
      name,
      price,
      description,
      imageURL,
    });

    await newItem.save();

    res.status(201).json({ message: 'Item added successfully', item: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Error adding item', error });
  }
}

module.exports = addItem;