const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST"]
  }
});

// Store for all poll rooms
const rooms = new Map();

// Route to check if a room exists
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (rooms.has(roomId)) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Create a new poll room
  socket.on('create_room', ({ username }) => {
    const roomId = uuidv4().substring(0, 6).toUpperCase(); // Generate shorter room code
    
    // Create room data structure
    const roomData = {
      id: roomId,
      creator: username,
      question: "Which do you prefer?",
      options: ["Cats", "Dogs"],
      votes: { "Cats": 0, "Dogs": 0 },
      voters: {}, // Track who voted for what
      startTime: Date.now(),
      endTime: Date.now() + 60000, // 60 seconds from now
      active: true
    };
    
    rooms.set(roomId, roomData);
    
    // Join the room
    socket.join(roomId);
    socket.emit('room_created', roomData);
    
    console.log(`Room created: ${roomId} by ${username}`);
    
    // Set timer to end the poll
    setTimeout(() => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.active = false;
        io.to(roomId).emit('poll_ended', room);
      }
    }, 60000);
  });
  
  // Join an existing room
  socket.on('join_room', ({ roomId, username }) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      socket.emit('room_joined', rooms.get(roomId));
      console.log(`${username} joined room: ${roomId}`);
    } else {
      socket.emit('error', { message: 'Room not found' });
    }
  });
  
  // Submit a vote
  socket.on('submit_vote', ({ roomId, username, option }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // Check if voting is still active
      if (!room.active) {
        socket.emit('error', { message: 'Voting has ended for this poll' });
        return;
      }
      
      // Check if user already voted
      if (room.voters[username]) {
        socket.emit('error', { message: 'You have already voted' });
        return;
      }
      
      // Record the vote
      room.votes[option]++;
      room.voters[username] = option;
      
      // Broadcast updated results to all users in the room
      io.to(roomId).emit('vote_update', room);
      console.log(`${username} voted for ${option} in room ${roomId}`);
    }
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});