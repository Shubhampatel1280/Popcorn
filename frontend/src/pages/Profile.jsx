import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext"; 
import "./Profile.css";

function Profile() {
  const { user, logout, refreshUser } = useAuth(); 
  const navigate = useNavigate();
  
  // --- DATA STATE ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // --- UI TOGGLE STATE ---
  const [activeSection, setActiveSection] = useState("bookings"); 

  // --- EDIT PROFILE STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user?.name || "");
  const [updatedEmail, setUpdatedEmail] = useState(user?.email || "");
  const [updatedPhone, setUpdatedPhone] = useState(user?.phone || "");
  const [updatedCity, setUpdatedCity] = useState(user?.city || "");
  const [updatedProfilePic, setUpdatedProfilePic] = useState(user?.profilePic || "");
  const [updateLoading, setUpdateLoading] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/user/${user.id}`);
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, [user]);

  useEffect(() => {
    const fetchMyFavorites = async () => {
      if (!user) return;
      try {
        const response = await fetch(`http://localhost:5000/api/auth/user-favorites/${user.id}`);
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      } finally {
        setLoadingFavorites(false);
      }
    };
    fetchMyFavorites();
  }, [user]);

  // --- HANDLERS ---
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!updatedName.trim() || !updatedEmail.trim()) return alert("Name and Email are required!"); 
    setUpdateLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          name: updatedName,
          email: updatedEmail,
          phone: updatedPhone,
          city: updatedCity,
          profilePic: updatedProfilePic
        })
      });

      const data = await response.json();

      if (data.success) {
        refreshUser(data.user); 
        setIsEditing(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setUpdatedName(user.name);
    setUpdatedEmail(user.email);
    setUpdatedPhone(user.phone || "");
    setUpdatedCity(user.city || "");
    setUpdatedProfilePic(user.profilePic || "");
    setIsEditing(false);
  };

  if (!user) return null; 

  // --- UPDATE 1: LIVE PREVIEW LOGIC ---
  // If editing, show what they are typing. Otherwise, show their saved pic.
  const currentPicToUse = isEditing ? updatedProfilePic : user.profilePic;
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.name}&background=7c5cff&color=fff&size=150`;
  
  const avatarSrc = currentPicToUse ? currentPicToUse : defaultAvatar;

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-banner"></div>

      <div className="profile-container">
        
        {/* LEFT SIDEBAR */}
        <div className="profile-sidebar">
          <div className="user-card">
            {/* --- UPDATE 2: ERROR FALLBACK --- */}
            <img 
              src={avatarSrc} 
              alt="Profile" 
              className="profile-avatar" 
              onError={(e) => {
                e.target.onerror = null; // prevents infinite loop
                e.target.src = defaultAvatar; // Instantly switches to initials if link is broken!
              }}
            />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            
            <div className="user-stats">
              <div className="stat-item">
                <h4>{bookings.length}</h4>
                <span>Bookings</span>
              </div>
              <div className="stat-item">
                <h4>{bookings.length * 50}</h4>
                <span>Points</span>
              </div>
            </div>

            <div className="gold-member-badge">
              <p>{bookings.length > 5 ? "Gold Member 👑" : "New Member 🎬"}</p>
              <span>Welcome to PoPCorn!</span>
            </div>
          </div>

          <div className="quick-actions-card">
            <h4>Quick Actions</h4>
            <button 
              className={`action-btn ${activeSection === "bookings" ? "active" : ""}`}
              onClick={() => setActiveSection("bookings")}
            >
              🎟 My Bookings
            </button>
            <button 
              className={`action-btn ${activeSection === "favorites" ? "active" : ""}`}
              onClick={() => setActiveSection("favorites")}
            >
              ❤️ Favorites
            </button>
            <button className="action-btn logout-text" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="profile-main">
          
          {/* PERSONAL INFO CARD (Always visible) */}
          <div className="info-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              {isEditing ? (
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSaveProfile} disabled={updateLoading}>
                    {updateLoading ? "Saving..." : "✓ Save"}
                  </button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>✏️ Edit</button>
              )}
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                {isEditing ? (
                  <input type="text" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} required />
                ) : ( <p>{user.name}</p> )}
              </div>
              
              <div className="info-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input type="email" value={updatedEmail} onChange={(e) => setUpdatedEmail(e.target.value)} required />
                ) : ( <p className={isEditing ? "not-provided" : ""}>{user.email}</p> )}
              </div>
              
              <div className="info-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input type="text" placeholder="+1 234 567 8900" value={updatedPhone} onChange={(e) => setUpdatedPhone(e.target.value)} />
                ) : ( <p className={user.phone ? "" : "not-provided"}>{user.phone || "Not provided"}</p> )}
              </div>
              
              <div className="info-item">
                <label>City</label>
                {isEditing ? (
                  <input type="text" placeholder="New York, NY" value={updatedCity} onChange={(e) => setUpdatedCity(e.target.value)} />
                ) : ( <p className={user.city ? "" : "not-provided"}>{user.city || "Not provided"}</p> )}
              </div>

              {isEditing && (
                <div className="info-item-full">
                  <label>Profile Picture URL (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/my-photo.jpg" 
                    value={updatedProfilePic} 
                    onChange={(e) => setUpdatedProfilePic(e.target.value)} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* MY BOOKINGS CARD (Conditionally hidden) */}
          <div className={`bookings-card section-content ${activeSection !== "bookings" ? "hidden" : ""}`}>
            <div className="card-header">
              <h3>Recent Bookings</h3>
            </div>

            <div className="bookings-list">
              {loading ? (
                <div className="loading-text">Loading your tickets...</div>
              ) : bookings.length === 0 ? (
                <div className="empty-bookings">
                  <p>You haven't booked any movies yet.</p>
                  <button className="browse-btn" onClick={() => navigate("/")}>Browse Movies</button>
                </div>
              ) : (
                bookings.map((booking) => {
                  if (!booking.movie) return null; 

                  return (
                    <div key={booking._id} className="booking-item">
                      <img src={booking.movie.posterPath} alt="movie" className="booking-poster" />
                      
                      <div className="booking-details">
                        <div className="booking-title-row">
                          <h4>{booking.movie.title}</h4>
                          <span className="status-badge confirmed">Confirmed</span>
                        </div>
                        <p className="booking-theater">{booking.theaterName}</p>
                        
                        <div className="booking-meta">
                          <div className="b-meta-item"><span>Date</span><p>{booking.dateDisplay || booking.date}</p></div>
                          <div className="b-meta-item"><span>Time</span><p>{booking.time}</p></div>
                          <div className="b-meta-item"><span>Seats</span><p>{booking.seats.join(", ")}</p></div>
                          <div className="b-meta-item"><span>Total</span><p>${booking.totalPrice.toFixed(2)}</p></div>
                        </div>
                      </div>

                      <div className="booking-actions">
                        <button className="view-btn" onClick={() => navigate("/confirmation", { state: { bookingId: booking._id } })}>🎟 View Ticket</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MY FAVORITES CARD (Conditionally hidden) */}
          <div className={`bookings-card section-content ${activeSection !== "favorites" ? "hidden" : ""}`}>
            <div className="card-header">
              <h3>My Favorites ❤️</h3>
            </div>

            <div className="bookings-list">
              {loadingFavorites ? (
                <div className="loading-text">Loading favorites...</div>
              ) : favorites.length === 0 ? (
                <div className="empty-favorites">
                  <p>You haven't liked any movies yet.</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {favorites.map((movie) => (
                    <MovieCard movie={movie} key={movie._id} /> 
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;