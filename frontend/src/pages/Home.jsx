import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";
import "./Home.css";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [activeFilter, setActiveFilter] = useState("All Movies");
  const [allMovies, setAllMovies] = useState([]); 
  const [displayedMovies, setDisplayedMovies] = useState([]); 
  const [loading, setLoading] = useState(true);

  const filters = ["All Movies", "Action", "Comedy", "Horror", "Sci-Fi", "Drama"];

  // 1. Fetch movies from Backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/movies");
        const data = await response.json();
        setAllMovies(data);
        setDisplayedMovies(data); 
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch movies", error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // --- COMBINED FILTERING & SEARCH LOGIC ---
  useEffect(() => {
    let result = allMovies;

    // Handle Search Query firsts
    if (searchQuery) {
      result = result.filter((movie) => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } 
    
    // Handle Category Filter next
    if (activeFilter !== "All Movies") {
      result = result.filter((movie) => {
        // Fallback to empty string if genre is somehow missing
        const genreStr = movie.genre || ""; 
        return genreStr.toLowerCase().includes(activeFilter.toLowerCase());
      });
    }

    setDisplayedMovies(result);
  }, [searchQuery, activeFilter, allMovies]);

  // Handler to change filter and clear search simultaneously
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (searchQuery) {
      setSearchParams({}); // This clears the ?search= query from the URL
    }
  };

  const featuredMovie = allMovies.length > 0 ? allMovies[0] : null;

  return (
    <div className="home-container">
      <Navbar />
      
      {!searchQuery && <Hero movie={featuredMovie} />}

      <div className="movies-section">
        <div className="section-header">
          <h2>{searchQuery ? `Search Results for "${searchQuery}"` : "Now Playing"}</h2>
          
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-text">Loading latest movies...</div>
        ) : (
          <div className="movies-grid">
            {displayedMovies.length > 0 ? (
              displayedMovies.map((movie) => (
                <MovieCard movie={movie} key={movie._id} /> 
              ))
            ) : (
              <div className="empty-results">
                <p>No movies found matching your selection.</p>
                <button className="browse-btn" onClick={() => handleFilterClick("All Movies")}>
                  Show All Movies
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;