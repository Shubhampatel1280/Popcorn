const mongoose = require("mongoose");

// We must explicitly tell Mongoose about EVERY field we want to save
const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  backdropPath: { type: String },
  
  // --- ADDED THE MISSING FIELDS HERE ---
  rating: { type: String },
  price: { type: Number },
  duration: { type: String },
  genre: { type: String },
  // -------------------------------------

  theaters: [
    {
      name: String,
      address: String,
      showtimes: [String]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);