import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"; 
import "./MovieDetails.css";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // --- DYNAMIC DATE GENERATION (TIMEZONE FIXED) ---
  const [dates] = useState(() => {
    const generatedDates = [];
    const today = new Date(); 

    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      // FIX: Manually build the YYYY-MM-DD string using LOCAL time, not UTC!
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');

      generatedDates.push({
        fullDateStr: `${year}-${month}-${day}`, // No more timezone shifting!
        displayMonth: nextDate.toLocaleString('default', { month: 'short' }).toUpperCase(),
        displayDate: nextDate.getDate(),
        displayDay: nextDate.toLocaleString('default', { weekday: 'short' }).toUpperCase(),
        displayYear: year
      });
    }
    return generatedDates;
  });

  // Track the show details the user selects
  const [selectedDateStr, setSelectedDateStr] = useState(dates[0].fullDateStr);
  const [selectedTheaterId, setSelectedTheaterId] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/movies/${id}`);
        const data = await response.json();
        setMovie(data);
        if (data.theaters?.length > 0) {
          setSelectedTheaterId(0); // Select first theater by default
        }
      } catch (error) {
        console.error("Failed to fetch movie details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/auth/user-favorites/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.some(fav => fav._id === id)) {
            setIsFavorite(true);
          }
        })
        .catch(err => console.error(err));
    }
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) { alert("Please log in to add favorites!"); return; }
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    const endpoint = newStatus ? "add-favorite" : "remove-favorite";
    try {
      await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, movieId: id })
      });
    } catch (error) {
      console.error(error);
      setIsFavorite(!newStatus); 
    }
  };

  // --- UPDATED SHOWTIME HANDLER ---
  const handleTimeSelect = (time, tIndex) => {
    // 1. Update active state locally
    setSelectedTime(time);
    setSelectedTheaterId(tIndex);

    // 2. Prepare the data for Seat Selection
    const selectedTheater = movie.theaters[tIndex];
    const selectedDateObj = dates.find(d => d.fullDateStr === selectedDateStr);

    // Formatting for display on the final ticket
    const displayDateStr = `${selectedDateObj.displayDate} ${selectedDateObj.displayMonth} ${selectedDateObj.displayYear}`;

    const pendingBooking = {
      movieId: id,
      date: selectedDateStr,    // YYYY-MM-DD (for taken seats query)
      dateDisplay: displayDateStr, // For the final ticket
      time: time,
      theaterName: selectedTheater.name,
      theaterAddress: selectedTheater.address
    };

    // 3. Save the single, complete object to local storage
    localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    localStorage.removeItem("savedSeats"); // Clear any old progress

    navigate(`/seats/${id}`);
  };

  if (loading) {
    return (
      <div className="details-page">
        <Navbar />
        <div className="details-message">Loading Movie Details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="details-page">
        <Navbar />
        <div className="details-message">Movie not found!</div>
      </div>
    );
  }

  // Formatting current date display for meta-info
  const activeDateObj = dates.find(d => d.fullDateStr === selectedDateStr);
  const currentShowDay = `${activeDateObj.displayDay}, ${activeDateObj.displayDate} ${activeDateObj.displayMonth} 2026`;

  return (
    <div className="details-page">
      <Navbar />

      <div className="details-container">
        {/* LEFT COLUMN */}
        <div className="left-column">
          <div className="poster-container">
            <img src={movie.posterPath} className="poster-img" alt={movie.title} />
            <div className="poster-tags"><span>IMAX</span><span>2D</span></div>
          </div>
          {/* Cast Card remains same */}
          <div className="cast-crew-card"><h4>Cast & Crew</h4><div className="cast-list"><div className="cast-member"><img src="https://i.pravatar.cc/100?img=11" alt="Director" /><p>Director</p></div><div className="cast-member"><img src="https://i.pravatar.cc/100?img=12" alt="Lead" /><p>Lead</p></div></div></div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="details-header">
            <div>
              <h1>{movie.title}</h1>
              <div className="meta-info">
                <span>📍 Currently: {localStorage.getItem("cineCity") || "New York"}</span>
                <span>📅 {currentShowDay}</span>
                <span>🕒 {movie.duration || "2h 15m"}</span>
              </div>
            </div>
            <button className={`wishlist-btn ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite}>
              {isFavorite ? "❤️" : "♡"}
            </button>
          </div>

          <div className="synopsis-section">
            <h3>Synopsis</h3>
            <p>Dive into unforgettable moments. Experience concerts and films with top artists. Feel the energy, see the performance up close, and create unforgettable memories.</p>
          </div>

          <h3 className="section-title">Select Date (March 2026)</h3>
          <div className="dates-row">
            {dates.map((d, index) => (
              <div 
                key={index} 
                className={`date-card ${selectedDateStr === d.fullDateStr ? "active" : ""}`}
                onClick={() => { setSelectedDateStr(d.fullDateStr); setSelectedTime(null); }} // Clear time if date changes
              >
                <p>{d.displayMonth}</p>
                <h2>{d.displayDate}</h2>
                <p>{d.displayDay}</p>
              </div>
            ))}
          </div>

          <h3 className="section-title">Select Theater & Time</h3>
          <div className="theaters-list">
            {movie.theaters && movie.theaters.map((theater, tIndex) => (
              <div key={tIndex} className={`theater-card ${selectedTheaterId === tIndex && selectedTime ? 'active' : ''}`}>
                <div className="theater-top">
                  <div className="theater-info">
                    <h4>📍 {theater.name}</h4>
                    <p>{theater.address}</p>
                  </div>
                  <span className="status available">Available</span>
                </div>

                <div className="times-row">
                  {theater.showtimes.map((time, sIndex) => (
                    <button 
                      key={sIndex}
                      className={`time-btn ${selectedTime === time && selectedTheaterId === tIndex ? "active" : ""}`}
                      onClick={() => handleTimeSelect(time, tIndex)}
                    >
                      <p>{time}</p>
                      <p>Standard</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default MovieDetails;