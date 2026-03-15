import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
// --- NEW IMPORTS FOR PDF ---
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// --- NEW IMPORT FOR THE REAL QR CODE ---
import fakeQrCode from "../assets/fake_qr.svg"; 
import "./Confirmation.css";

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE FOR DOWNLOAD BUTTON ---
  const [downloading, setDownloading] = useState(false);
  
  // --- NEW REF TO TARGET THE TICKET ---
  const ticketRef = useRef(null);

  // Get the booking ID passed from the Checkout page
  const bookingId = location.state?.bookingId;

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!user || !bookingId) {
        // If they bypass checkout and come here directly, send them home
        navigate("/");
        return;
      }

      try {
        // Fetch all bookings for the user
        const response = await fetch(`http://localhost:5000/api/bookings/user/${user.id}`);
        const allBookings = await response.json();
        
        // Find the specific booking that matches our new booking ID
        const currentBooking = allBookings.find(b => b._id === bookingId);
        
        if (currentBooking) {
          setTicketData(currentBooking);
        }
      } catch (error) {
        console.error("Failed to load ticket", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [user, bookingId, navigate]);

  // --- THE PDF GENERATOR LOGIC ---
  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);

    try {
      // 1. Take a high-res screenshot of the ticket div (useCORS allows the movie poster to load)
      const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // 2. Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height to maintain aspect ratio, add a 15mm margin
      const margin = 15;
      const printWidth = pdfWidth - (margin * 2);
      const printHeight = (canvas.height * printWidth) / canvas.width;

      // 3. Add the image to the PDF and download it
      pdf.addImage(imgData, "PNG", margin, margin, printWidth, printHeight);
      pdf.save(`PoPCorn_Ticket_${ticketData._id.slice(-6).toUpperCase()}.pdf`);
      
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to download ticket. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="conf-page">
        <Navbar />
        <h3 className="conf-loading">Generating your ticket...</h3>
      </div>
    );
  }

  if (!ticketData) return null;

  return (
    <div className="conf-page">
      <Navbar />

      <div className="conf-wrapper">
        
        {/* WE ADDED ref={ticketRef} HERE SO IT ONLY CAPTURES THE TICKET */}
        <div className="conf-ticket-card" ref={ticketRef}>
          
          {/* Top Green Success Banner */}
          <div className="conf-banner">
            <div className="conf-check-icon">
              <span>✓</span>
            </div>
            <h2>Booking Confirmed!</h2>
            <p>Your ticket has been saved to your profile</p>
          </div>

          {/* Ticket Details */}
          <div className="conf-details-section">
            <div className="conf-movie-info">
              
              {/* --- FIX 1: CORS Proxy and Wrapper Div for PDF Engine --- */}
              <div style={{ width: '90px', height: '130px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                <img 
                  src={`https://wsrv.nl/?url=${encodeURIComponent(ticketData.movie.posterPath)}`} 
                  alt="poster" 
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://i.postimg.cc/Hk4jP98p/movie-placeholder.png";
                  }}
                />
              </div>

              <div className="conf-text-group">
                <h3>{ticketData.movie.title}</h3>
                <p className="conf-theater">📍 {ticketData.theaterName}</p>
                
                <div className="conf-datetime">
                  <span className="conf-label">Date & Time</span>
                  <p className="conf-value">{ticketData.dateDisplay || ticketData.date} • {ticketData.time}</p>
                </div>
              </div>
            </div>

            <div className="conf-seats-box">
               <span className="conf-label">Seats</span>
               <p className="conf-seats-value">{ticketData.seats.join(', ')}</p>
            </div>

            {/* Perforated Line */}
            <div className="conf-divider">
              <div className="conf-hole-left"></div>
              <div className="conf-hole-right"></div>
            </div>

            <div className="conf-footer-info">
              <div>
                <span className="conf-label">Booking ID</span>
                <p className="conf-id">#{ticketData._id.slice(-6).toUpperCase()}</p>
              </div>
              
              {/* --- FIX 2: Dynamic PNG QR Code API (Fixes SVG Zoom Bug) --- */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData._id}`} 
                alt="qr-code" 
                crossOrigin="anonymous"
                style={{ width: '70px', height: '70px', objectFit: 'contain', background: '#f0f0f0', padding: '5px', borderRadius: '8px' }} 
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS (Placed OUTSIDE the ref so they don't print on the PDF!) */}
        <div className="conf-actions">
          <button 
            className="conf-btn conf-btn-download" 
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? "Generating PDF..." : "📥 Download Ticket (PDF)"}
          </button>

          <div className="conf-btn-row">
            <button className="conf-btn conf-btn-outline" onClick={() => navigate("/profile")}>
              View Profile
            </button>
            <button className="conf-btn conf-btn-solid" onClick={() => navigate("/")}>
              Book Another
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Confirmation;