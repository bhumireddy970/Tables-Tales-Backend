const express = require("express");
const {
  addDeliveryBoy,
  showDeliveryBoys,
} = require("../controllers/delivery.js");
const router = express.Router();
const multer = require("multer");

// Use memory storage to keep file buffer in memory for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add a delivery boy with image upload (field name: imageURL)
router.post("/add", upload.single("imageURL"), addDeliveryBoy);

// Route to fetch all delivery boys
router.get("/show", showDeliveryBoys);

module.exports = router;
