# Real-Time Poll Application

A real-time polling application that allows users to create or join poll rooms and vote on options. Results update instantly across all connected users in the same room through WebSocket communication.

## Setup Instructions

### Prerequisites
- Node.js
- npm

### Backend Setup

1. Clone this repository

2. Navigate to the server directory:
   ```bash
   cd server
   ```

3. Install dependencies:
   ```bash
   npm install express socket.io uuid cors
   ```

4. Start the server:
   ```bash
   node server.js
   ```

   The server will run on port 5000 by default.

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install react react-dom react-router-dom socket.io-client axios
   npm install tailwindcss @tailwindcss/vite
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`

## Features Implemented

1. **User Authentication**
   - Simple username-based authentication (no password required)
   - Username persistence using localStorage

2. **Room Management**
   - Create new poll rooms with unique 6-character codes
   - Join existing rooms using room codes
   - Room validation to ensure rooms exist before joining

3. **Real-Time Polling**
   - Vote on one of two predefined options ("Cats" vs "Dogs")
   - Live updates of voting results across all connected users
   - Visual progress bars showing vote percentages
   - Prevention of duplicate votes from the same user

4. **Time Management**
   - 60-second countdown timer for each poll
   - Visual indication of remaining time
   - Automatic disabling of voting when time expires
   - Poll results remain visible after poll closing

5. **State Persistence**
   - User votes are persisted in localStorage
   - Users can refresh the page without losing their vote

## Architecture: Vote State Sharing and Room Management

The application implements a real-time state management system using WebSockets (Socket.IO) to handle vote synchronization and room management. On the server side, all active poll rooms are stored in an in-memory Map structure, where each room has a unique ID as its key and an object containing room data as its value. This room data includes the question, options, vote counts, a record of who voted for what, and timing information.

When a user votes, the client emits a 'submit_vote' event to the server with the room ID, username, and selected option. The server validates the vote (checking if the user already voted and if the poll is still active), updates the room's vote counts, and then broadcasts the updated room data to all clients in that room using Socket.IO's room feature. This approach ensures all connected clients see the same vote counts in real-time without requiring polling or page refreshes.

To prevent duplicate votes, the server maintains a 'voters' object within each room, mapping usernames to their selected options. Additionally, the client stores the user's vote in localStorage to maintain the vote state across page reloads. The architecture efficiently handles multiple concurrent rooms, each with its own isolated state, while providing immediate feedback to all participants through WebSocket communication.

## Project Structure

### Backend
- `server.js` - Main server file with WebSocket and HTTP endpoints
- `package.json` - Project dependencies and scripts

### Frontend
- `src/App.js` - Main component with routing
- `src/components/Home.js` - Landing page for creating/joining rooms
- `src/components/PollRoom.js` - Poll room with voting interface
- `src/components/CountdownTimer.js` - Timer component for polls

## License

MIT

## Author

Ritik Rai