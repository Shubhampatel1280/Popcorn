import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

function MovieCard({ movie }) {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
<div className="movie-card" onClick={() => navigate(`/movie/${movie._id}`)}>
        <div className="poster-container">
        <img src={movie.posterPath} alt={movie.title} className="movie-poster" />
        <div className="rating-badge">
          ⭐ {movie.rating || "4.5"}
        </div>
      </div>
      
      <div className="movie-info">
        <h3>{movie.title}</h3>
        
        <div className="movie-meta">
          <span>🕒 {movie.duration || "2h 15m"}</span>
          {/* Optional: if you want to show the genre on the card! */}
          {/* <span> • {movie.genre}</span> */}
        </div>
        
        <div className="movie-footer">
          <div className="price-info">
            <span className="starts-from">STARTS FROM</span>
            <span className="price">${movie.price || "55"}</span>
          </div>

         <button 
            className="book-btn"
            onClick={(e) => {
              e.stopPropagation(); // Prevents the browser from clicking the card behind it
              navigate(`/movie/${movie._id}`);
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;