const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB database
require('dotenv').config();

// Use environment variables for sensitive information
const MONGO_URI = process.env.MONGO_URI;
// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define schema for 'banners' collection
const bannerSchema = new mongoose.Schema({
  image: String,
});

const Banner = mongoose.model("Banner", bannerSchema);

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Define route to fetch banner images
app.get("/banners", async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define schema for 'items' collection
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  // Add more fields as needed
});

const Item = mongoose.model("Item", itemSchema);

// Define route to fetch items
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define route to fetch items of a specific store
app.get("/storeItems", async (req, res) => {
  try {
    const storeName = req.query.storeName;
    const items = await Item.find({ storeName }); // Assuming storeName is a field in your Item schema
    res.json(items);
  } catch (error) {
    console.error("Error fetching store items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define schema for 'banners' collection
const storeSchema = new mongoose.Schema({
  image: String,
});

const Store = mongoose.model("Stores", storeSchema);

// Define route to fetch store images
app.get("/stores", async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to handle quote requests
app.post("/send-quote", async (req, res) => {
  const { cartItems, email } = req.body;

  // Generate the PDF quote
  const pdfPath = generateQuote(cartItems, email);

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Configure your email service
    // For example, Gmail:
    service: "gmail",
    auth: {
      user: "khanyadlamnini22@gmail.com",
      pass: "your-password",
    },
  });

  // Send the email with the PDF quote attached
  transporter.sendMail(
    {
      from: "khanyadlamnini22@gmail.com",
      to: email,
      subject: "Quote",
      text: "Please find attached the quote.",
      attachments: [
        {
          filename: "quote.pdf",
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    },
    (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send quote email" });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Quote sent successfully" });
      }
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
