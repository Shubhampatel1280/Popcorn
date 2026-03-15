import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import "./Theaters.css";

function Theaters() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  // Premium mock theaters data
  const theatersList = [
    {
      id: "t1",
      name: "AMC Empire 25",
      address: "234 W 42nd St, New York, NY",
      distance: "1.2 km away",
      amenities: ["IMAX", "Dolby Atmos", "Recliners"],
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "t2",
      name: "Alamo Drafthouse Lower Manhattan",
      address: "28 Liberty St, New York, NY",
      distance: "3.5 km away",
      amenities: ["Dine-In", "4K Laser", "Bar"],
      image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "t3",
      name: "Regal Union Square",
      address: "850 Broadway, New York, NY",
      distance: "2.1 km away",
      amenities: ["4DX", "ScreenX", "Recliners"],
      image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "t4",
      name: "PoPCorn Premium Times Square",
      address: "1 Broadway, New York, NY",
      distance: "1.5 km away",
      amenities: ["IMAX", "Dine-In", "Dolby Atmos"],
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "t5",
      name: "Nitehawk Cinema Williamsburg",
      address: "136 Metropolitan Ave, Brooklyn",
      distance: "5.8 km away",
      amenities: ["Dine-In", "Indie Films", "Bar"],
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "t6",
      name: "Cinemark Reserve Lincoln Square",
      address: "1998 Broadway, New York, NY",
      distance: "2.9 km away",
      amenities: ["IMAX", "Recliners", "Cafe"],
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const filterPills = ["All", "IMAX", "Dine-In", "Recliners", "Dolby Atmos", "4DX"];

  // Filter logic: If "All", show all. Otherwise, check if the theater's amenities array includes the active filter.
  const displayedTheaters = activeFilter === "All"
    ? theatersList
    : theatersList.filter(theater => theater.amenities.includes(activeFilter));

  return (
    <div className="theaters-page">
      <Navbar />

      <div className="theaters-container">
        <div className="theaters-header">
          <h1>Cinemas Near You</h1>
          <p>Discover premium movie experiences, from IMAX screens to luxury dine-in seating.</p>
        </div>

        {/* AMENITY FILTERS */}
        <div className="theater-filters">
          {filterPills.map((pill, idx) => (
            <button
              key={idx}
              className={`t-filter-pill ${activeFilter === pill ? "active" : ""}`}
              onClick={() => setActiveFilter(pill)}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* THEATERS GRID */}
        <div className="theaters-grid">
          {displayedTheaters.length > 0 ? (
            displayedTheaters.map((theater) => (
              <div 
                key={theater.id} 
                className="theater-card"
                // This routes to our upcoming Page 2!
                onClick={() => navigate(`/theater/${theater.id}`)}
              >
                <div className="t-image-wrapper">
                  <img src={theater.image} alt={theater.name} className="t-image" />
                  <div className="t-distance-badge">{theater.distance}</div>
                </div>
                
                <div className="t-info">
                  <h3>{theater.name}</h3>
                  <p className="t-address">📍 {theater.address}</p>
                  
                  <div className="t-amenities">
                    {theater.amenities.map((amenity, i) => (
                      <span key={i} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-theaters">
              <p>No theaters found with the '{activeFilter}' feature.</p>
              <button onClick={() => setActiveFilter("All")}>View All Theaters</button>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default Theaters;