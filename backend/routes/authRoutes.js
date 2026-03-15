const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ success: true, message: "User registered successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the entered password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token (Valid for 1 day)
    // Note: In a real app, "mysecretkey" should be in a .env file!
    const token = jwt.sign({ userId: user._id }, "mysecretkey", { expiresIn: "1d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- ADD TO BOTTOM OF backend/routes/authRoutes.js ---

// UPDATE USER PROFILE
router.patch("/update-profile", async (req, res) => {
  try {
    const { userId, name, email, phone, city, profilePic } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if they are trying to change to an email that someone else owns
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use by another account." });
    }

    // Update fields (if a field isn't provided, keep the old one)
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.city = city !== undefined ? city : user.city;
    user.profilePic = profilePic !== undefined ? profilePic : user.profilePic;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// --- ADD TO backend/routes/authRoutes.js ---

// 1. ADD TO FAVORITES
router.post("/add-favorite", async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    const user = await User.findById(userId);
    
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 2. REMOVE FROM FAVORITES
router.post("/remove-favorite", async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    const user = await User.findById(userId);
    
    // Filter out the ID to remove it
    user.favorites = user.favorites.filter(id => id.toString() !== movieId);
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 3. GET FULL FAVORITE MOVIES DETAILS (for Profile page)
router.get("/user-favorites/:userId", async (req, res) => {
  try {
    // We populate("favorites") so we get full Movie documents, not just IDs
    const user = await User.findById(req.params.userId).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;