const express = require("express");
const router = express.Router();
const axios = require("axios");
const Movie = require("../models/Movie");

const TMDB_API_KEY = "c6ed1f148afc7d2d0e85d151607dc83f"; 

// Quick dictionary to translate TMDB's number IDs to real string genres
const tmdbGenres = { 28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western" };

const generateMockTheaters = () => {
  return [
    { name: "PoPCorn Time Square", address: "1 Broadway, NY", showtimes: ["10:00 AM", "01:30 PM", "06:00 PM"] },
    { name: "AMC Empire 25", address: "234 W 42nd St, NY", showtimes: ["11:00 AM", "04:00 PM", "09:00 PM"] }
  ];
};

router.get("/", async (req, res) => {
  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    const tmdbMovies = tmdbResponse.data.results;
    const moviesToReturn = [];

    for (let tmdbMovie of tmdbMovies) {
      let existingMovie = await Movie.findOne({ tmdbId: tmdbMovie.id });

      if (!existingMovie) {
        // Map the IDs to real genre names (limit to first 2)
        const movieGenres = tmdbMovie.genre_ids
          .map(id => tmdbGenres[id])
          .filter(Boolean)
          .slice(0, 2)
          .join(", ") || "Action / Drama";

        existingMovie = new Movie({
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          posterPath: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
          backdropPath: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : null,
          rating: (tmdbMovie.vote_average / 2).toFixed(1),
          price: 55, 
          duration: "2h 15m", 
          genre: movieGenres, // REAL GENRES SAVED HERE!
          theaters: generateMockTheaters()
        });
        
        await existingMovie.save();
      }
      
      moviesToReturn.push(existingMovie);
    }

    res.json(moviesToReturn);

  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Server Error fetching movies" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;