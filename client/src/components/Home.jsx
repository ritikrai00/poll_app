import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = ({ socket, username, setUsername }) => {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle creating a new poll room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setLoading(true);
    
    socket.emit('create_room', { username });
    
    socket.once('room_created', (roomData) => {
      setLoading(false);
      navigate(`/room/${roomData.id}`);
    });
  };

  // Handle joining an existing poll room
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if room exists
      const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
      
      if (response.data.exists) {
        // Join the room
        socket.emit('join_room', { roomId, username });
        
        socket.once('room_joined', () => {
          setLoading(false);
          navigate(`/room/${roomId}`);
        });
      } else {
        setError('Room not found');
        setLoading(false);
      }
    } catch (err) {
      setError('Error connecting to server');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Live Poll App</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Your Name:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            {loading ? 'Loading...' : 'Create New Poll Room'}
          </button>
          
          <div className="flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          
          <form onSubmit={handleJoinRoom} className="flex flex-col space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="roomId">
                Room Code:
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              {loading ? 'Loading...' : 'Join Poll Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;