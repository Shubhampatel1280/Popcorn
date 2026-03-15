import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./TheaterDetails.css";

function TheaterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Same Theater Data for Lookup (In a real app, this comes from the DB)
  const theatersMap = {
    "t1": { name: "AMC Empire 25", address: "234 W 42nd St, New York, NY", amenities: ["IMAX", "Dolby Atmos", "Recliners"], image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1200", defaultTimes: ["10:00 AM", "01:30 PM", "06:00 PM", "09:30 PM"] },
    "t2": { name: "Alamo Drafthouse Lower Manhattan", address: "28 Liberty St, New York, NY", amenities: ["Dine-In", "4K Laser", "Bar"], image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=1200", defaultTimes: ["11:15 AM", "02:45 PM", "07:00 PM"] },
    "t3": { name: "Regal Union Square", address: "850 Broadway, New York, NY", amenities: ["4DX", "ScreenX", "Recliners"], image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&q=80&w=1200", defaultTimes: ["12:00 PM", "04:30 PM", "08:15 PM"] },
    "t4": { name: "PoPCorn Premium Times Square", address: "1 Broadway, New York, NY", amenities: ["IMAX", "Dine-In", "Dolby Atmos"], image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200", defaultTimes: ["09:30 AM", "01:00 PM", "05:00 PM", "08:45 PM"] },
    "t5": { name: "Nitehawk Cinema Williamsburg", address: "136 Metropolitan Ave, Brooklyn", amenities: ["Dine-In", "Indie Films", "Bar"], image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1200", defaultTimes: ["03:00 PM", "06:30 PM", "10:15 PM"] },
    "t6": { name: "Cinemark Reserve Lincoln Square", address: "1998 Broadway, New York, NY", amenities: ["IMAX", "Recliners", "Cafe"], image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200", defaultTimes: ["10:45 AM", "02:15 PM", "07:30 PM"] }
  };

  const theater = theatersMap[id];

  // 2. Dynamic Date Generation (Timezone Bug Fixed!)
  const [dates] = useState(() => {
    const generatedDates = [];
    const today = new Date(); 
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');

      generatedDates.push({
        fullDateStr: `${year}-${month}-${day}`, 
        displayMonth: nextDate.toLocaleString('default', { month: 'short' }).toUpperCase(),
        displayDate: nextDate.getDate(),
        displayDay: nextDate.toLocaleString('default', { weekday: 'short' }).toUpperCase(),
        displayYear: year
      });
    }
    return generatedDates;
  });

  const [selectedDateStr, setSelectedDateStr] = useState(dates[0].fullDateStr);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Fetch real movies from the database!
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/movies");
        const data = await response.json();
        // Just take the first 4 movies for this specific theater to keep it clean
        setMovies(data.slice(0, 4)); 
      } catch (error) {
        console.error("Failed to fetch movies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // 4. THE MAGIC ROUTER: Creates booking data & sends to Seat Selection!
  const handleShowtimeSelect = (movie, time) => {
    const selectedDateObj = dates.find(d => d.fullDateStr === selectedDateStr);
    const displayDateStr = `${selectedDateObj.displayDate} ${selectedDateObj.displayMonth} ${selectedDateObj.displayYear}`;

    const pendingBooking = {
      movieId: movie._id,
      date: selectedDateStr,    
      dateDisplay: displayDateStr, 
      time: time,
      theaterName: theater.name,
      theaterAddress: theater.address
    };

    localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    localStorage.removeItem("savedSeats"); // Clear old seats
    navigate(`/seats/${movie._id}`);
  };

  if (!theater) return <div className="td-loading"><Navbar /><h2>Theater not found</h2></div>;

  return (
    <div className="theater-details-page">
      <Navbar />

      {/* HERO SECTION */}
      <div className="td-hero" style={{ backgroundImage: `url(${theater.image})` }}>
        <div className="td-hero-overlay"></div>
        <div className="td-hero-content">
          <h1>{theater.name}</h1>
          <p>📍 {theater.address}</p>
          <div className="td-amenities-row">
            {theater.amenities.map((amenity, i) => (
              <span key={i} className="td-amenity-tag">{amenity}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="td-main-container">
        {/* DATE SELECTOR */}
        <h3 className="td-section-title">Select Date</h3>
        <div className="td-dates-row">
          {dates.map((d, index) => (
            <div 
              key={index} 
              className={`td-date-card ${selectedDateStr === d.fullDateStr ? "active" : ""}`}
              onClick={() => setSelectedDateStr(d.fullDateStr)}
            >
              <p>{d.displayMonth}</p>
              <h2>{d.displayDate}</h2>
              <p>{d.displayDay}</p>
            </div>
          ))}
        </div>

        {/* NOW SHOWING MOVIES */}
        <h3 className="td-section-title">Now Showing</h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading movies...</p>
        ) : (
          <div className="td-movies-list">
            {movies.map((movie) => (
              <div key={movie._id} className="td-movie-card">
                <img src={movie.posterPath} alt={movie.title} className="td-movie-poster" />
                
                <div className="td-movie-info">
                  <div className="td-movie-header">
                    <h4>{movie.title}</h4>
                    <span className="td-movie-meta">{movie.duration || "2h 15m"} • {movie.genre || "Action"}</span>
                  </div>

                  <p className="td-instruction">Select a showtime to book seats:</p>
                  
                  <div className="td-showtimes-grid">
                    {theater.defaultTimes.map((time, idx) => (
                      <button 
                        key={idx} 
                        className="td-time-btn"
                        onClick={() => handleShowtimeSelect(movie, time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default TheaterDetails;