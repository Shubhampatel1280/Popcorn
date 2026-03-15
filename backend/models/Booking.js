const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Link to the User who made the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Link to the Movie
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },
  theaterName: String,
  date: String,
  time: String,
  seats: [String],
  totalPrice: Number
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);