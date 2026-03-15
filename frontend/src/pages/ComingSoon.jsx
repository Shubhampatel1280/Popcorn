import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ComingSoon.css";

function ComingSoon({ title }) {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-page">
      <Navbar />
      
      <div className="coming-soon-container">
        <h2>🚀 {title}</h2>
        <p>
          We are currently working hard behind the scenes to bring you the best 
          {title.toLowerCase()} experience. Stay tuned for updates!
        </p>
        <button className="back-home-btn" onClick={() => navigate("/")}>
          Return to Movies
        </button>
      </div>
    </div>
  );
}

export default ComingSoon;