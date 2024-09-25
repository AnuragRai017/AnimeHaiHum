import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ContinueWatching = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get('http://localhost:8001/users/1/continue-watching/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVideos(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Continue Watching</h1>
      <ul>
        {videos.map((video: { video_id: string; last_position: number }) => (
          <li key={video.video_id}>{video.video_id} - Last Position: {video.last_position}</li>
        ))}
      </ul>
    </div>
  );
};

export default ContinueWatching;
