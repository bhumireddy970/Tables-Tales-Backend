const cloudinary = require("../config/cloudinary"); // adjust path
const DeliveryBoy = require("../models/deliveryboy");
const streamifier = require("streamifier");

async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "deliveryboys" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function addDeliveryBoy(req, res) {
  const { email, firstName, lastName, phone, status, rating } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ message: "Email and phone are required." });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    // Check if email already exists
    const existingDeliveryBoy = await DeliveryBoy.findOne({ email });
    if (existingDeliveryBoy) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageURL = uploadResult.secure_url;

    // Create new delivery boy record
    const newDeliveryBoy = await DeliveryBoy.create({
      email,
      firstName,
      lastName,
      phone,
      status,
      rating,
      imageURL,
    });

    return res
      .status(201)
      .json({
        message: "Delivery boy added successfully",
        data: newDeliveryBoy,
      });
  } catch (error) {
    console.error("Error adding delivery boy:", error);
    return res
      .status(500)
      .json({ message: "Error adding delivery boy", error: error.message });
  }
}

async function showDeliveryBoys(req, res) {
  try {
    const boys = await DeliveryBoy.find({});
    if (!boys || boys.length === 0) {
      return res.status(404).json({ message: "No delivery boys found" });
    }
    return res.status(200).json({ deliverboys: boys });
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

module.exports = {
  addDeliveryBoy,
  showDeliveryBoys,
};
