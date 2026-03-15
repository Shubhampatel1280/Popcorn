import { useState, useEffect, useRef } from "react"; // <-- MUST IMPORT useRef!
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"; 
import Navbar from "../components/Navbar";
import "./SeatSelection.css";

const socket = io("http://localhost:5000");

function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [movieDetails, setMovieDetails] = useState(null);
  const [showInfo, setShowInfo] = useState(null);
  const [showId, setShowId] = useState(""); 
  
  const [bookedSeats, setBookedSeats] = useState([]); 
  const [lockedSeats, setLockedSeats] = useState([]);
  
  const [selectedSeats, setSelectedSeats] = useState(() => {
    const savedSeats = localStorage.getItem("savedSeats");
    return savedSeats ? JSON.parse(savedSeats) : [];
  });

  // 1. REF FIX: Keeps track of our seats so WebSockets don't cause visual glitches
  const selectedSeatsRef = useRef(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
    localStorage.setItem("savedSeats", JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  const rows = ['A', 'B', 'C', 'D'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];
  const prices = { VIP: 75, REGULAR: 50, FEE: 5 };

  // 1. INITIAL LOAD & GENERATE SHOW ID
  useEffect(() => {
    const loadShowData = async () => {
      const pending = localStorage.getItem("pendingBooking");
      if (!pending) { navigate("/"); return; }
      const parsedInfo = JSON.parse(pending);
      setShowInfo(parsedInfo);

      const generatedShowId = `${id}-${parsedInfo.date}-${parsedInfo.time}-${parsedInfo.theaterName}`;
      setShowId(generatedShowId);

      try {
        const movieRes = await fetch(`http://localhost:5000/api/movies/${id}`);
        const movieData = await movieRes.json();
        setMovieDetails(movieData);
      } catch (error) { console.error(error); }
    };
    loadShowData();
  }, [id, navigate]);

  // 1.5. THE 3-SECOND AUTO-REFRESH (POLLING FALLBACK)
  // This guarantees the UI updates the taken seats even if WebSockets fail!
  useEffect(() => {
    if (!showInfo) return;

    const fetchTakenSeats = async () => {
      try {
        const queryParams = new URLSearchParams({
          movieId: id, 
          theaterName: showInfo.theaterName, 
          date: showInfo.date, 
          time: showInfo.time
        });
        const seatsRes = await fetch(`http://localhost:5000/api/bookings/taken-seats?${queryParams}`);
        const takenSeatsData = await seatsRes.json();
        setBookedSeats(takenSeatsData);
      } catch (error) { 
        console.error("Failed to fetch taken seats", error); 
      }
    };

    fetchTakenSeats(); // Fetch immediately when the page loads
    const intervalId = setInterval(fetchTakenSeats, 3000); // Fetch again every 3 seconds

    return () => clearInterval(intervalId); // Cleanup when leaving page
  }, [id, showInfo]);

  // 2. BULLETPROOF WEBSOCKET SYNC
  useEffect(() => {
    if (!showId) return;

    const syncWithServer = () => {
      socket.emit("join_show", showId);
      // Re-lock our seats in case we refreshed the page
      selectedSeatsRef.current.forEach(seat => {
        socket.emit("lock_seat", { showId, seatId: seat });
      });
    };

    // Ensure we only join when the socket is fully connected
    if (socket.connected) { syncWithServer(); }
    socket.on("connect", syncWithServer);

    socket.on("current_locks", (locks) => {
      // Ignore locks for seats we already have in our own cart!
      const validLocks = locks.filter(seat => !selectedSeatsRef.current.includes(seat));
      setLockedSeats(validLocks);
    });

    socket.on("seat_locked", (seatId) => {
      // If someone else locks a seat, only grey it out if we don't own it
      if (!selectedSeatsRef.current.includes(seatId)) {
        setLockedSeats((prev) => prev.includes(seatId) ? prev : [...prev, seatId]);
      }
    });

    socket.on("seat_unlocked", (seatId) => {
      setLockedSeats((prev) => prev.filter((s) => s !== seatId));
    });

    return () => {
      socket.off("connect", syncWithServer);
      socket.off("current_locks");
      socket.off("seat_locked");
      socket.off("seat_unlocked");
    };
  }, [showId]);

  // 3. SECURITY GUARD: KICK OUT ALREADY BOOKED SEATS
  useEffect(() => {
    if (bookedSeats.length > 0) {
      setSelectedSeats(prevSeats => {
        const cleanedSeats = prevSeats.filter(seat => !bookedSeats.includes(seat));
        if (cleanedSeats.length !== prevSeats.length) {
          localStorage.setItem("savedSeats", JSON.stringify(cleanedSeats));
        }
        return cleanedSeats;
      });
    }
  }, [bookedSeats]);

  // 4. SAVE PROGRESS
  useEffect(() => {
    localStorage.setItem("savedSeats", JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  function toggleSeat(seatId) {
    if (bookedSeats.includes(seatId) || lockedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      socket.emit("unlock_seat", { showId, seatId });
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
      socket.emit("lock_seat", { showId, seatId });
    }
  }

  if (!showInfo || !movieDetails) return null;

  const vipSeats = selectedSeats.filter(seat => seat.startsWith('A'));
  const regularSeats = selectedSeats.filter(seat => !seat.startsWith('A'));
  
  const vipTotal = vipSeats.length * prices.VIP;
  const regularTotal = regularSeats.length * prices.REGULAR;
  const feeTotal = selectedSeats.length > 0 ? prices.FEE : 0;
  const grandTotal = vipTotal + regularTotal + feeTotal;

  return (
    <div className="seat-selection-page">
      <Navbar />

      <div className="layout-container">
        
        {/* LEFT COLUMN - SEAT MAP */}
        <div className="seat-map-section">
          <div className="seat-header">
            <h2>Select Seats</h2>
            <div className="seat-legend">
              <div className="legend-item"><div className="legend-box available"></div> Available</div>
              <div className="legend-item"><div className="legend-box booked"></div> Booked/Locked</div>
              <div className="legend-item"><div className="legend-box selected"></div> Selected</div>
              <div className="legend-item"><div className="legend-box vip"></div> VIP ($75)</div>
            </div>
          </div>

          <div className="seats-container">
            {rows.map(row => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                
                <div className="row-seats">
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const isUnavailable = bookedSeats.includes(seatId) || lockedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isVip = row === 'A';

                    return (
                      <div key={seatId} className="seat-wrapper">
                        <div
                          className={`seat ${isUnavailable ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isVip && !isUnavailable ? 'vip' : ''}`}
                          onClick={() => toggleSeat(seatId)}
                        >
                          {seatId}
                        </div>
                        {(col === 2 || col === 6) && <div className="seat-spacer"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="screen-area">
            <div className="screen-line"></div>
            <p className="screen-text">ALL EYES THIS WAY</p>
          </div>
        </div>

        {/* RIGHT COLUMN - BOOKING SUMMARY */}
        <div className="summary-section">
          <h3>Booking Summary</h3>
          
          <div className="movie-summary">
            <div>
                <h4>{movieDetails.title}</h4>
                <p>{showInfo.theaterName}</p>
            </div>
            <div className="summary-date">
                {/* DYNAMIC DATE IS HERE */}
                <p>{showInfo.dateDisplay}</p>
                <p className="summary-time-text">{showInfo.time}</p>
            </div>
          </div>

          <div className="price-breakdown">
            {vipSeats.length > 0 && (
              <div className="price-row">
                <span>VIP Seat ({vipSeats.join(', ')})</span>
                <span>${vipTotal.toFixed(2)}</span>
              </div>
            )}
            
            {regularSeats.length > 0 && (
              <div className="price-row">
                <span>Regular Seat ({regularSeats.join(', ')})</span>
                <span>${regularTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="price-row">
              <span>Convenience Fee</span>
              <span>${feeTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="total-row">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <button 
            className="pay-btn" 
            disabled={selectedSeats.length === 0}
            onClick={() => navigate("/checkout")}
          >
            <span>Pay ${grandTotal.toFixed(2)}</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default SeatSelection;