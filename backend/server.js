// backend/server.js
const express = require("express");
const cors = require("cors");
const http = require("http"); // <-- Import the built-in HTTP module
const { Server } = require("socket.io"); // <-- Import Socket.io
const connectDB = require("./config/db");

const movieRoutes = require("./routes/movieRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Create an HTTP server using the Express app
const server = http.createServer(app); 

// Initialize Socket.io and allow CORS so React can talk to it
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Make sure this matches your React port!
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);

// Listen for users connecting to the site
// Create a Set to act as our server's memory for currently locked seats
// --- WEBSOCKET LOGIC (backend/server.js) ---
const activeLocks = new Set();
const userLocks = new Map(); // NEW: Tracks which socket ID owns which locks!

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  userLocks.set(socket.id, new Set()); // Create an empty inventory for the new user

  socket.on("join_show", (showId) => {
    socket.join(showId);
    
    // Find all locks for this specific movie showtime
    const currentLocks = Array.from(activeLocks)
      .filter(lock => lock.startsWith(`${showId}:`))
      .map(lock => lock.split(":")[1]);
      
    socket.emit("current_locks", currentLocks);
  });

  socket.on("lock_seat", ({ showId, seatId }) => {
    const lockString = `${showId}:${seatId}`;
    activeLocks.add(lockString);
    userLocks.get(socket.id).add(lockString); // Add to this user's personal inventory
    socket.to(showId).emit("seat_locked", seatId);
  });

  socket.on("unlock_seat", ({ showId, seatId }) => {
    const lockString = `${showId}:${seatId}`;
    activeLocks.delete(lockString);
    userLocks.get(socket.id).delete(lockString);
    socket.to(showId).emit("seat_unlocked", seatId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const locks = userLocks.get(socket.id);
    
    if (locks) {
      // If the user closes the tab/browser, instantly free up their seats for everyone else!
      locks.forEach(lockString => {
        activeLocks.delete(lockString);
        const [showId, seatId] = lockString.split(":");
        socket.to(showId).emit("seat_unlocked", seatId);
      });
    }
    userLocks.delete(socket.id);
  });
});

// IMPORTANT: Change app.listen to server.listen!
server.listen(5000, () => {
  console.log("Server running on port 5000 with WebSockets enabled");
});