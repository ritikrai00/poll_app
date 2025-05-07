import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './components/Home';
import PollRoom from './components/PollRoom';
import './index.css';

const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  // Connect to Socket.io server
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Load username from localStorage if available
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Socket error handling
    newSocket.on('error', (errorData) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Save username to localStorage
  const handleSetUsername = (name) => {
    setUsername(name);
    localStorage.setItem('username', name);
  };

  // Ensure socket is connected before rendering routes
  if (!socket) {
    return <div className="flex justify-center items-center h-screen">Connecting to server...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {error && (
          <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
            {error}
          </div>
        )}
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                socket={socket} 
                username={username} 
                setUsername={handleSetUsername} 
              />
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              username ? (
                <PollRoom 
                  socket={socket} 
                  username={username} 
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;