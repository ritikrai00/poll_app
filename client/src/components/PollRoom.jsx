import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const PollRoom = ({ socket, username }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(null);
  
  useEffect(() => {
    // Check if we have a saved vote in localStorage
    const savedVote = localStorage.getItem(`vote-${roomId}-${username}`);
    if (savedVote) {
      setUserVote(savedVote);
    }
    
    // Join the room
    socket.emit('join_room', { roomId, username });
    
    // Handle room data when joining
    socket.on('room_joined', (roomData) => {
      setRoom(roomData);
      setLoading(false);
      
      // Check if user already voted in this room
      if (roomData.voters && roomData.voters[username]) {
        setUserVote(roomData.voters[username]);
        localStorage.setItem(`vote-${roomId}-${username}`, roomData.voters[username]);
      }
    });
    
    // Handle vote updates
    socket.on('vote_update', (updatedRoom) => {
      setRoom(updatedRoom);
    });
    
    // Handle when poll ends
    socket.on('poll_ended', (endedRoom) => {
      setRoom(endedRoom);
    });
    
    // Handle errors
    socket.on('error', (errorData) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 3000);
    });
    
    return () => {
      socket.off('room_joined');
      socket.off('vote_update');
      socket.off('poll_ended');
      socket.off('error');
    };
  }, [socket, roomId, username]);
  
  // Handle user voting
  const handleVote = (option) => {
    if (room && room.active && !userVote) {
      socket.emit('submit_vote', {
        roomId,
        username,
        option
      });
      
      setUserVote(option);
      localStorage.setItem(`vote-${roomId}-${username}`, option);
    }
  };
  
  // Calculate vote percentages
  const calculatePercentage = (option) => {
    if (!room) return 0;
    
    const totalVotes = Object.values(room.votes).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    return Math.round((room.votes[option] / totalVotes) * 100);
  };
  
  // Return to home
  const handleBackToHome = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading poll room...</div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-xl mb-4">Room not found or has expired.</div>
        <button 
          onClick={handleBackToHome}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Poll Room</h1>
          <div className="text-sm bg-gray-200 px-3 py-1 rounded">
            Room: <span className="font-mono font-bold">{roomId}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Voting as:</p>
          <p className="font-semibold">{username}</p>
        </div>
        
        <div className="mb-6">
          <CountdownTimer endTime={room.endTime} active={room.active} />
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">{room.question}</h2>
          
          <div className="space-y-4">
            {room.options.map((option) => (
              <div key={option} className="border rounded-lg overflow-hidden">
                <div 
                  className="relative"
                  onClick={() => handleVote(option)}
                >
                  <div 
                    className={`
                      p-4 relative z-10 flex justify-between items-center
                      cursor-pointer hover:bg-gray-50 transition-colors
                      ${userVote === option ? 'bg-blue-50' : ''}
                      ${!room.active || userVote ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center">
                      {userVote === option && (
                        <span className="mr-2 text-blue-500">✓</span>
                      )}
                      <span className="font-medium">{option}</span>
                    </div>
                    <div className="font-bold">
                      {calculatePercentage(option)}%
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-500"
                    style={{ width: `${calculatePercentage(option)}%` }}
                  ></div>
                </div>
                
                <div className="px-4 py-2 bg-gray-50 text-sm">
                  {room.votes[option]} vote{room.votes[option] !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          {!room.active ? (
            <div className="text-red-500 font-bold mb-4">This poll has ended</div>
          ) : userVote ? (
            <div className="text-green-500 font-bold mb-4">You voted for {userVote}</div>
          ) : (
            <div className="text-blue-500 font-bold mb-4">Select an option to vote</div>
          )}
          
          <button 
            onClick={handleBackToHome}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollRoom;