const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process if the connection fails
  }
}

module.exports = connectToMongo;
