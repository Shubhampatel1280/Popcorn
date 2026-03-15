import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import { useAuth } from "../context/AuthContext"; 
import "./Offers.css";

function Offers() {
  const { user } = useAuth(); // Grabbing your real user from the backend

  // Start at 0, NO hardcoded 850 fallback!
  const [points, setPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState([]);
  const [copiedCode, setCopiedCode] = useState("");

  // Sync perfectly with the backend user data once it loads
 // --- REAL MATH: Fetch bookings and calculate points (50 pts per booking) ---
  useEffect(() => {
    const fetchAndCalculatePoints = async () => {
      if (user && (user.id || user._id)) {
        try {
          // Fetch the user's actual bookings from the database
          const userId = user.id || user._id; 
          const response = await fetch(`http://localhost:5000/api/bookings/user/${userId}`);
          const bookings = await response.json();
          
          if (Array.isArray(bookings)) {
            // Your exact math: 50 points per booking!
            const calculatedPoints = bookings.length * 50;
            setPoints(calculatedPoints);
          }
        } catch (error) {
          console.error("Failed to fetch points", error);
        }
      }
    };

    fetchAndCalculatePoints();
  }, [user]);

  const handleRedeem = (itemTitle, cost) => {
    if (points >= cost) {
      // Presentation magic: visual subtraction only, so your DB stays safe for the demo!
      setPoints(points - cost); 
      setRedeemedItems([...redeemedItems, itemTitle]);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000); 
  };

  // --- REWARDS DATA ---
  const rewards = [
    { title: "Free Fountain Drink", cost: 300, icon: "🥤", desc: "Refresh yourself with a medium fountain drink of your choice." },
    { title: "Exclusive Movie Poster", cost: 400, icon: "🖼️", desc: "Take home a limited edition poster from currently playing movies." },
    { title: "Free Large Popcorn", cost: 500, icon: "🍿", desc: "Claim a fresh, buttery large popcorn at the concession stand." },
    { title: "Nachos & Cheese Combo", cost: 600, icon: "🧀", desc: "A delicious tray of crispy nachos with warm jalapeño cheese." },
    { title: "Standard Movie Ticket", cost: 800, icon: "🎟️", desc: "One free standard admission ticket for any regular 2D movie." },
    { title: "VIP Recliner Upgrade", cost: 1500, icon: "👑", desc: "Upgrade your standard seat to a luxury fully-reclining leather seat." },
    { title: "1-Month Premium Pass", cost: 2000, icon: "🌟", desc: "Waive all convenience fees on bookings for an entire month." },
    { title: "Couple's Date Night", cost: 2500, icon: "🥂", desc: "2 VIP Tickets, 2 Drinks, and a Large Popcorn on us." }
  ];

  // --- BANK & PROMO OFFERS ---
  const bankOffers = [
    { title: "BOGO with Chase Sapphire", code: "CHASEBOGO", desc: "Buy one ticket, get one free on weekends.", discount: "50% OFF" },
    { title: "HDFC Card Weekend Special", code: "HDFCWE", desc: "Use your HDFC Credit Card for flat discounts on Saturdays.", discount: "25% OFF" },
    { title: "Student Snack Combo", code: "STUDENT20", desc: "Get 20% off all food & beverages with valid College ID.", discount: "20% OFF" },
    { title: "Late Night Owl Discount", code: "NIGHTOWL", desc: "Booking a show after 10 PM? Enjoy a flat discount.", discount: "15% OFF" },
    { title: "First Time User Bonus", code: "WELCOME50", desc: "New to PoPCorn? Get a massive discount on your first booking.", discount: "50% OFF" },
    { title: "Family Pack Blockbuster", code: "FAMJAM", desc: "Booking 4 or more tickets? Get a flat ₹200 off your total.", discount: "₹200 OFF" },
    { title: "Amex Platinum Lounge", code: "AMEXVIP", desc: "Free entry to the VIP lounge before your movie begins.", discount: "FREE ENTRY" },
    { title: "Half-Price Tuesdays", code: "TUESDAY50", desc: "All standard 2D movie tickets are half price every Tuesday.", discount: "50% OFF" }
  ];

  return (
    <div className="offers-page">
      <Navbar />

      <div className="offers-container">
        {/* POINTS DASHBOARD */}
        <div className="points-dashboard">
          <div className="points-info">
            <h2>{user ? `${user.name}'s PoPPoints` : "Loading PoPPoints..."}</h2>
            <p>Earn points on every booking and redeem them for exclusive rewards!</p>
          </div>
          <div className="points-circle">
            <h3>{points}</h3>
            <span>PTS</span>
          </div>
        </div>

        {/* REWARDS SECTION */}
        <div className="section-block">
          <h2 className="section-title">Redeem Your Points</h2>
          <div className="rewards-grid">
            {rewards.map((reward, idx) => {
              const canAfford = points >= reward.cost;
              const isRedeemed = redeemedItems.includes(reward.title);

              return (
                <div key={idx} className={`reward-card ${!canAfford && !isRedeemed ? "locked" : ""}`}>
                  <div className="reward-icon">{reward.icon}</div>
                  <div className="reward-details">
                    <h4>{reward.title}</h4>
                    <p>{reward.desc}</p>
                    <span className="reward-cost">{reward.cost} Points</span>
                  </div>
                  <button 
                    className={`redeem-btn ${isRedeemed ? "redeemed" : !canAfford ? "disabled" : ""}`}
                    onClick={() => handleRedeem(reward.title, reward.cost)}
                    disabled={!canAfford || isRedeemed}
                  >
                    {isRedeemed ? "Redeemed!" : canAfford ? "Redeem Now" : `Need ${reward.cost - points} more`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* BANK & PROMO OFFERS */}
        <div className="section-block">
          <h2 className="section-title">Partner Offers & Discounts</h2>
          <div className="promos-grid">
            {bankOffers.map((promo, idx) => (
              <div key={idx} className="promo-card">
                <div className="promo-badge">{promo.discount}</div>
                <div className="promo-content">
                  <h4>{promo.title}</h4>
                  <p>{promo.desc}</p>
                  <div className="promo-code-box">
                    <span className="code">{promo.code}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => handleCopy(promo.code)}
                    >
                      {copiedCode === promo.code ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default Offers;