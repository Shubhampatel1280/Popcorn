import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchInput, setSearchInput] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchInput.trim() !== "") {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput("");
    }
  };

  return (
    <div className="navbar">
      <div className="logo">
        <Link to="/">
          {/* Replace src with your actual logo file path */}
          <img src="/popcorn.png" className="logo-img" alt="PoPCorn Logo" />
          <span className="logo-text">PoPCorn</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Movies</Link>
        <Link to="/theaters" className={location.pathname === "/theaters" ? "active" : ""}>Theaters</Link>
        <Link to="/events" className={location.pathname === "/events" ? "active" : ""}>Events</Link>
        <Link to="/offers" className={location.pathname === "/offers" ? "active" : ""}>Offers</Link>
      </div>

      <div className="search">
        <FaSearch style={{ color: "#999" }} />
        <input
          placeholder="Search movies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="auth-section">
        {user ? (
          <div className="profile-dropdown">
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="profile">
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=7c5cff&color=fff`}
                  alt="avatar"
                />
                <span>{user.name}</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <div className="guest-links">
            <Link to="/login" className="login-link">Log In</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;