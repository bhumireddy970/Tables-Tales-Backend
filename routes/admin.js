const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // import your cloudinary config
const Item = require("../models/item");
const router = express.Router();

// Use multer memory storage to get file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/addItem", upload.single("image"), async (req, res) => {
  const { name, category, price, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    // Upload image buffer to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "restaurant_items", // optional folder name in Cloudinary
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ message: "Image upload failed", error });
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
        return res
          .status(201)
          .json({ message: "Item added successfully", item: newItem });
      }
    );

    // Pipe the buffer into upload_stream
    const stream = cloudinary.uploader.upload_stream;
    const bufferStream = require("stream").Readable.from(req.file.buffer);
    bufferStream.pipe(result);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Error adding item", error });
  }
});

module.exports = router;
