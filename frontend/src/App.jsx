import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Import this

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ComingSoon from "./pages/ComingSoon"; // <-- Add this import
import Events from "./pages/events";
import Theaters from "./pages/Theaters";
import TheaterDetails from "./pages/TheaterDetails";
import Offers from "./pages/offers";
import Payment from "./pages/payment";

function App() {
  return (
    <BrowserRouter>
      {/* We already wrapped App with AuthProvider in main.jsx, so you don't need it twice if it's there. 
          If it's not in main.jsx, keep it here like this: */}
        <Routes>
          {/* Public Routes (Guest Browsing Allowed) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/movie/:id" element={<MovieDetails />} />

          {/* Protected Routes (Login Required) */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/seats/:id" element={
            <ProtectedRoute><SeatSelection /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute><Events /></ProtectedRoute>
          } />
          <Route path="/Theaters" element={
            <ProtectedRoute><Theaters /></ProtectedRoute>
          } />
         <Route path="/theater/:id" element={<TheaterDetails />} />
         <Route path="/Offers" element={<Offers />} />
         <Route path="/payment" element={<Payment />} />
          
          <Route path="/confirmation" element={
            <ProtectedRoute><Confirmation /></ProtectedRoute>
          } />

{/* // Add the new import at the top
import Events from "./pages/Events"; */}

{/* // Down inside your <Routes>: */}
{/* // 1. Update the /events path to point to your new page */}
<Route path="/events" element={<Events />} />

{/* // 2. Add a generic /coming-soon path to catch all the dead-end clicks from the Events page! */}
<Route path="/coming-soon" element={<ComingSoon title="Feature" />} />
          
        {/* NEW PLACEHOLDER ROUTES */}
        {/* <Route path="/theaters" element={<ComingSoon title="Theaters" />} /> */}
        {/* <Route path="/events" element={<ComingSoon title="Events & Experiences" />} /> */}
        {/* <Route path="/offers" element={<ComingSoon title="Special Offers" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;