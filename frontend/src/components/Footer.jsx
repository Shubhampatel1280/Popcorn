import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/popcorn.png" alt="PoPCorn Logo" />
            <span>PoPCorn</span>
          </div>
          <p>Experience the magic of cinema. Book tickets for the latest movies, explore top-rated theaters, and never miss an event.</p>
          <div className="social-links">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Movies</Link></li>
            <li><Link to="/theaters">Theaters</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/offers">Offers</Link></li>
          </ul>
        </div>

        <div className="footer-support">
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PoPCorn. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;