import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth(); // We need the user to link the booking to them!
  
  const [bookingData, setBookingData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Retrieve the saved data from localStorage when the page loads
  useEffect(() => {
    const pending = localStorage.getItem("pendingBooking");
    const savedSeats = localStorage.getItem("savedSeats");

    if (pending && savedSeats) {
      setBookingData(JSON.parse(pending));
      setSeats(JSON.parse(savedSeats));
    } else {
      // If there's no data, send them back to the home page
      navigate("/");
    }
  }, [navigate]);

  if (!bookingData || seats.length === 0) return null;

  // Calculate prices exactly like we did on the SeatSelection page
  const vipSeats = seats.filter(seat => seat.startsWith('A'));
  const regularSeats = seats.filter(seat => !seat.startsWith('A'));
  const totalPrice = (vipSeats.length * 75) + (regularSeats.length * 50) + 5; // +5 for convenience fee

  // --- NEW: Redirect to the Payment Gateway Page ---
  const proceedToPayment = () => {
    navigate("/payment", { 
      state: { bookingData, seats, totalPrice } 
    });
  };

  return (
    <div className="checkout-page">
      <Navbar />

      <div className="checkout-wrapper">
        <div className="checkout-card">
          <h2>Checkout</h2>

          {error && <div className="error-msg">{error}</div>}

          <div className="checkout-details">
            <div className="checkout-row">
              <span>Date & Time</span>
              <font>{bookingData.date}  • {bookingData.time}</font>
            </div>
            <div className="checkout-row">
              <span>Selected Seats</span>
              <font>{seats.join(", ")}</font>
            </div>
            
            <div className="checkout-total">
              <span>Total Amount</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* --- UPDATED BUTTON --- */}
          <button 
            className="checkout-btn" 
            onClick={proceedToPayment} 
          >
            Proceed to Payment 💳
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;