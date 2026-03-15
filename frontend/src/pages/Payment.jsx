import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// --- IMPORT YOUR FAKE QR HERE ---
import fakeQrCode from "../assets/fake_qr.svg"; // Use .png if your file is a png!
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { bookingData, seats, totalPrice } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("card"); 
  const [paymentStatus, setPaymentStatus] = useState("idle"); 
  const [loadingText, setLoadingText] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [error, setError] = useState("");

  if (!bookingData || !seats) {
    navigate("/");
    return null;
  }

  const fillTestData = () => {
    setCardDetails({
      number: "4242 4242 4242 4242",
      name: user?.name || "John Doe",
      expiry: "12/28",
      cvv: "123"
    });
  };

  const handleConfirmPayment = async (e, method = "card") => {
    if (e) e.preventDefault();
    setPaymentStatus("processing");
    setError("");

    // --- CUSTOM REALISTIC LOADING SEQUENCES ---
    if (method === "apple") {
      setLoadingText("Double Click to Pay...");
      setTimeout(() => setLoadingText("Face ID Verified ✓"), 1000);
      setTimeout(() => setLoadingText("Apple Pay Processing..."), 2000);
    } else if (method === "qr") {
      setLoadingText("Waiting for phone scan...");
      setTimeout(() => setLoadingText("Payment Received ✓"), 1200);
    } else {
      setLoadingText("Contacting Bank...");
      setTimeout(() => setLoadingText("Verifying Security & CVV..."), 1200);
    }

    // --- REAL BACKEND SAVE ---
    setTimeout(async () => {
      setLoadingText("Securing your seats...");
      
      const finalBooking = {
        user: user.id, 
        movie: bookingData.movieId,
        theaterName: bookingData.theaterName, 
        date: bookingData.date, 
        time: bookingData.time,
        seats: seats,
        totalPrice: totalPrice
      };

      try {
        const response = await fetch("http://localhost:5000/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalBooking)
        });

        const data = await response.json();

        if (!data.success) {
          alert(data.message); 
          navigate(`/seats/${bookingData.movieId}`); 
          return; 
        }

        localStorage.removeItem("pendingBooking");
        localStorage.removeItem("savedSeats");

        setPaymentStatus("success");
        setLoadingText("Payment Successful! Redirecting...");

        setTimeout(() => {
          navigate("/confirmation", { state: { bookingId: data.booking._id } });
        }, 1000);

      } catch (error) {
        console.error("Payment failed", error);
        setError("Payment authorization failed. Please try again.");
        setPaymentStatus("idle");
      }
    }, method === "apple" ? 3000 : 2500); 
  };

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <h2>Secure Checkout</h2>
            <div className="secure-badge">🔒 Encrypted</div>
          </div>
          
          <div className="payment-amount-box">
            <span>Total Amount Due</span>
            <h2>${totalPrice?.toFixed(2)}</h2>
          </div>

         {/* --- NEW: PAYMENT METHOD SWITCHER WITH FIXED APPLE LOGO --- */}
          <div className="payment-methods">
            <button className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')} disabled={paymentStatus !== 'idle'}>
              💳 Card
            </button>
            <button className={`method-tab ${paymentMethod === 'apple' ? 'active' : ''}`} onClick={() => setPaymentMethod('apple')} disabled={paymentStatus !== 'idle'}>
              {/* FIXED APPLE SVG ICON FOR TAB */}
              <svg viewBox="0 0 384 512" width="13" height="13" style={{ marginRight: '5px', fill: 'currentColor', display: 'inline-block', verticalAlign: '-1.5px' }}>
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              Apple Pay
            </button>
            <button className={`method-tab ${paymentMethod === 'qr' ? 'active' : ''}`} onClick={() => setPaymentMethod('qr')} disabled={paymentStatus !== 'idle'}>
              📱 Scan QR
            </button>
          </div>

          {error && <div className="payment-error">{error}</div>}

          {/* --- METHOD 1: CREDIT CARD --- */}
          {paymentMethod === "card" && (
            <form onSubmit={(e) => handleConfirmPayment(e, "card")} className="payment-form">
              <button className="test-card-btn" onClick={fillTestData} type="button" disabled={paymentStatus !== "idle"}>
                💳 Auto-Fill Test Card
              </button>
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" required maxLength="19" value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})} disabled={paymentStatus !== "idle"}/>
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input type="text" placeholder="Name on card" required value={cardDetails.name} onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})} disabled={paymentStatus !== "idle"}/>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Expiry (MM/YY)</label>
                  <input type="text" placeholder="MM/YY" required maxLength="5" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} disabled={paymentStatus !== "idle"}/>
                </div>
                <div className="form-group half">
                  <label>CVV</label>
                  <input type="password" placeholder="123" required maxLength="4" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})} disabled={paymentStatus !== "idle"}/>
                </div>
              </div>
              <button type="submit" className={`confirm-pay-btn ${paymentStatus === 'success' ? 'success' : ''}`} disabled={paymentStatus !== "idle"}>
                {paymentStatus === "idle" ? `Pay $${totalPrice?.toFixed(2)}` : loadingText}
              </button>
            </form>
          )}

          {/* --- METHOD 2: APPLE PAY (REALISTIC UI) --- */}
          {paymentMethod === "apple" && (
            <div className="alt-payment-container">
              <button className={`apple-pay-real-btn ${paymentStatus === 'success' ? 'success' : ''}`} onClick={(e) => handleConfirmPayment(e, "apple")} disabled={paymentStatus !== "idle"}>
                {paymentStatus === "idle" ? (
                  <>
                    <svg viewBox="0 0 384 512" width="22" height="22" style={{ marginRight: '6px', fill: 'white', display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                    </svg>
                    Pay
                  </>
                ) : loadingText}
              </button>
            </div>
          )}

          {/* --- METHOD 3: QR SCAN (WITH YOUR LOCAL QR) --- */}
          {paymentMethod === "qr" && (
            <div className="alt-payment-container">
              <p className="qr-text">Scan to Pay with Venmo / Cash App</p>
              <div className="qr-box">
                {/* USING YOUR OWN IMPORTED QR IMAGE HERE */}
                <img src={fakeQrCode} alt="Payment QR" />
              </div>
              <button className={`qr-simulate-btn ${paymentStatus === 'success' ? 'success' : ''}`} onClick={(e) => handleConfirmPayment(e, "qr")} disabled={paymentStatus !== "idle"}>
                {paymentStatus === "idle" ? "Simulate Phone Scan" : loadingText}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Payment;