import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/rooms')
      .then(res => setRooms(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleJoin = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Salles de discussion</h2>
      <ul>
        {rooms.map(room => (
          <li key={room._id} className="mb-4 p-4 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => handleJoin(room._id)}>
            <h3 className="text-xl">{room.name}</h3>
            <p>{room.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
