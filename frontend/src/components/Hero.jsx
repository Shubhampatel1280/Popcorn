import { useNavigate } from "react-router-dom";
import "./Hero.css";

// We now accept a 'movie' prop to make this dynamic!
function Hero({ movie }) {
  const navigate = useNavigate();

  // If the API hasn't loaded the movie yet, show a placeholder
  if (!movie) {
    return <div className="hero" style={{ background: "#333" }}>Loading featured movie...</div>;
  }

  // Simple trick to find a trailer without needing a complex YouTube API key
  const handleTrailerClick = () => {
    const searchQuery = encodeURIComponent(`${movie.title} official trailer`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, "_blank");
  };

  return (
    <div 
      className="hero" 
      // Changed posterPath to backdropPath for a perfect wide fit!
      style={{ backgroundImage: `url(${movie.backdropPath})` }}
    >
      <div className="hero-content">
        <span className="badge">NOW SHOWING</span>
        
        {/* Dynamic Title and Description */}
        <h1>{movie.title}</h1>
        <p>
          Experience the cinematic event of the year. Book your tickets now
          to see {movie.title} on the big screen, featuring exclusive IMAX and 3D showings.
        </p>

        <div className="hero-buttons">
          <button 
            className="btn-primary" 
            onClick={() => navigate(`/movie/${movie._id}`)}
          >
            🎟 Book Tickets
          </button>

          <button 
            className="btn-secondary" 
            onClick={handleTrailerClick}
          >
            ▶ Watch Trailer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;