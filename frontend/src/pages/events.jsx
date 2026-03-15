import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Events.css";

function Events() {
  const navigate = useNavigate();

  // --- CAROUSEL LOGIC ---
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- FILTER LOGIC ---
  const [activeFilter, setActiveFilter] = useState("All");

  const heroEvents = [
    {
      id: 1,
      dateStr: "Sat, 14 Mar - Sun, 15 Mar, 11:00 AM",
      title: "New York Comic Con 2026",
      venue: "Javits Center, NYC",
      price: "$30 onwards",
      image: "https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=1000" 
    },
    {
      id: 2,
      dateStr: "Fri, 20 Mar, 8:00 PM",
      title: "Taylor Swift: The Eras Tour",
      venue: "MetLife Stadium, NY",
      price: "$125 onwards",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1000" 
    },
    {
      id: 3,
      dateStr: "Sun, 22 Mar, 7:30 PM",
      title: "New York Knicks vs. Chicago Bulls",
      venue: "Madison Square Garden, NY",
      price: "$55 onwards",
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  // Auto-slide every 4 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroEvents.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [heroEvents.length]);

  const categories = [
    { name: "Music", icon: "🎵" }, { name: "Nightlife", icon: "🍸" },
    { name: "Comedy", icon: "🎤" }, { name: "Sports", icon: "🏆" },
    { name: "Performances", icon: "🎭" }, { name: "Food & Drinks", icon: "🍔" },
    { name: "Fests & Fairs", icon: "🎪" }, { name: "Expos", icon: "🖼️" }
  ];

  const artists = [
    { name: "Taylor Swift", img: "https://i.pravatar.cc/150?img=47" },
    { name: "John Mulaney", img: "https://i.pravatar.cc/150?img=11" },
    { name: "Billy Joel", img: "https://i.pravatar.cc/150?img=68" },
    { name: "Kevin Hart", img: "https://i.pravatar.cc/150?img=14" },
    { name: "Dua Lipa", img: "https://i.pravatar.cc/150?img=5" },
    { name: "LeBron James", img: "https://i.pravatar.cc/150?img=33" }
  ];

  // 12 NY Events (Fixed broken images & added 2 new ones to fill the grid!)
  const allEvents = [
    { id: 101, category: "Music", title: "Billy Joel Residency", date: "Wed, 18 Mar, 8:00 PM", venue: "Madison Square Garden, NY", price: "$85 onwards", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=500" },
    { id: 102, category: "Comedy", title: "John Mulaney: In Concert", date: "Thu, 19 Mar, 7:30 PM", venue: "Radio City Music Hall, NY", price: "$40 onwards", img: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=500" },
    { id: 103, category: "Sports", title: "Brooklyn Nets vs. Lakers", date: "Sun, 22 Mar, 6:00 PM", venue: "Barclays Center, Brooklyn", price: "$65 onwards", img: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=500" },
    { id: 104, category: "Performances", title: "The Lion King on Broadway", date: "Tue, 24 Mar, 7:00 PM", venue: "Minskoff Theatre, NY", price: "$95 onwards", img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=500" },
    { id: 105, category: "Nightlife", title: "Boiler Room NYC", date: "Fri, 27 Mar, 10:00 PM", venue: "Brooklyn Mirage, NY", price: "$25 onwards", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=500" },
    { id: 106, category: "Food & Drinks", title: "Central Park Food Festival", date: "Sat, 28 Mar, 12:00 PM", venue: "Central Park, NY", price: "$15 onwards", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=500" },
    { id: 107, category: "Music", title: "Dua Lipa: Future Nostalgia", date: "Mon, 30 Mar, 8:00 PM", venue: "Barclays Center, Brooklyn", price: "$70 onwards", img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=500" },
    { id: 108, category: "Comedy", title: "Comedy Cellar Showcase", date: "Wed, 1 Apr, 9:00 PM", venue: "MacDougal St, Greenwich", price: "$18 onwards", img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=500" },
    { id: 109, category: "Expos", title: "NY Tech Innovation Expo", date: "Sat, 4 Apr, 10:00 AM", venue: "Javits Center, NYC", price: "$9.9 onwards", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=500" },
    { id: 110, category: "Sports", title: "New York Rangers NHL", date: "Sun, 5 Apr, 7:00 PM", venue: "Madison Square Garden, NY", price: "$50 onwards", img: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&q=80&w=500" },
    { id: 111, category: "Expos", title: "New York Auto Show 2026", date: "Tue, 7 Apr, 10:00 AM", venue: "Javits Center, NYC", price: "$22 onwards", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=500" },
    { id: 112, category: "Fests & Fairs", title: "Tribeca Film Festival", date: "Thu, 9 Apr, 5:00 PM", venue: "Tribeca, NY", price: "$35 onwards", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=500" }
  ];

  const filterPills = ["All", "Music", "Comedy", "Sports", "Nightlife", "Performances"];

  // THE WORKING FILTER LOGIC!
  const displayedEvents = activeFilter === "All" 
    ? allEvents 
    : allEvents.filter(event => event.category === activeFilter);

  // Universal handler for your dead-ends
  const handleComingSoon = () => navigate("/coming-soon");

  return (
    <div className="events-page">
      <Navbar />

      <div className="events-container">
        
        {/* 1. AUTO-SLIDING HERO CAROUSEL */}
        <div className="events-hero-section">
          {heroEvents.map((event, index) => (
            <div 
              key={event.id} 
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            >
              <div className="hero-content">
                <p className="hero-date">{event.dateStr}</p>
                <h1 className="hero-title">{event.title}</h1>
                <p className="hero-venue">{event.venue}</p>
                <p className="hero-price">{event.price}</p>
                <button className="book-tickets-btn" onClick={handleComingSoon}>
                  Book tickets
                </button>
              </div>
              <div className="hero-image-wrapper">
                <img src={event.image} alt={event.title} className="hero-image" />
              </div>
            </div>
          ))}
          
          <div className="carousel-indicators">
            {heroEvents.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* 2. EXPLORE EVENTS (CATEGORIES) */}
        <div className="section-block">
          <h2>Explore Events</h2>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <div key={idx} className="category-card" onClick={() => setActiveFilter(cat.name)}>
                <div className="cat-icon">{cat.icon}</div>
                <p>{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ARTISTS IN YOUR DISTRICT */}
        <div className="section-block">
          <h2>Trending Artists in NY</h2>
          <div className="artists-row">
            {artists.map((artist, idx) => (
              <div key={idx} className="artist-card" onClick={handleComingSoon}>
                <img src={artist.img} alt={artist.name} />
                <p>{artist.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ALL EVENTS GRID (WITH WORKING FILTERS) */}
        <div className="section-block" id="all-events">
          <h2>All events {activeFilter !== "All" && `- ${activeFilter}`}</h2>
          
          <div className="filter-pills-row">
            {filterPills.map((pill, idx) => (
              <button 
                key={idx} 
                className={`filter-pill ${activeFilter === pill ? "active" : ""}`} 
                onClick={() => setActiveFilter(pill)}
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="all-events-grid">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event) => (
                <div key={event.id} className="event-card" onClick={handleComingSoon}>
                  <div className="event-poster-wrapper">
                    <img src={event.img} alt={event.title} className="event-poster" />
                  </div>
                  <div className="event-info">
                    <p className="e-date">{event.date}</p>
                    <h4 className="e-title">{event.title}</h4>
                    <p className="e-venue">{event.venue}</p>
                    <p className="e-price">{event.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#777", padding: "20px 0" }}>No events found for {activeFilter}.</p>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default Events;