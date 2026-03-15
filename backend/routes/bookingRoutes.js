const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// 1. CREATE A NEW BOOKING
// CREATE A NEW BOOKING (backend/routes/bookingRoutes.js)
router.post("/", async (req, res) => {
  try {
    const { user, movie, theaterName, date, time, seats, totalPrice } = req.body;

    // --- THE ULTIMATE GUARD: Check if ANY of these seats are already booked ---
    const existingBooking = await Booking.findOne({
      movie: movie,
      theaterName: theaterName,
      date: date,
      time: time,
      seats: { $in: seats } // The $in operator checks if ANY requested seat is already taken
    });

    if (existingBooking) {
      // If a match is found, aggressively reject the booking!
      return res.status(400).json({
        success: false,
        message: "Double booking detected! One or more of these seats were just purchased."
      });
    }

    // If it is safe, create the booking
    const newBooking = new Booking({ user, movie, theaterName, date, time, seats, totalPrice });
    await newBooking.save();

    res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error creating booking" });
  }
});

// 2. GET ALL BOOKINGS FOR A SPECIFIC USER
router.get("/user/:userId", async (req, res) => {
  try {
    // Find bookings by user ID and attach the full Movie object details
    const bookings = await Booking.find({ user: req.params.userId }).populate("movie");
    res.json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
});

// --- ADD THIS TO backend/routes/bookingRoutes.js ---

// 3. GET TAKEN SEATS FOR A SPECIFIC SHOWTIME
router.get("/taken-seats", async (req, res) => {
  try {
    const { movieId, theaterName, date, time } = req.query;

    // Find all bookings that match this exact show
    const bookings = await Booking.find({
      movie: movieId,
      theaterName: theaterName,
      date: date,
      time: time
    });

    // Extract all the seats from those bookings and combine them into one flat array
    let takenSeats = [];
    bookings.forEach(booking => {
      takenSeats = takenSeats.concat(booking.seats);
    });

    res.json(takenSeats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch taken seats" });
  }
});

module.exports = router;