import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import VideoPlayer from "@/components/VideoPlayer";  // Import VideoPlayer component

interface VideoData {
  id: number;
  title: string;
  description: string;
  video_file_url: string;
  views_count: number;
  upload_time: string;
}

export default function WatchVideo() {
  const router = useRouter();
  const { id } = router.query;  // The dynamic video ID
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  useEffect(() => {
    if (id) {
      // Fetch the video details dynamically by ID
      axios
        .get(`http://localhost:8001/videos/${id}`)  // Update with your FastAPI backend endpoint
        .then((response) => {
          setVideoData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching video:", error);
        });
    }
  }, [id]);

  if (!videoData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">{videoData.title}</h1>
      <VideoPlayer 
        videoUrl={`http://localhost:8001/${videoData.video_file_url}?t=${new Date().getTime()}`} 
        videoId={videoData.id} 
        title={videoData.title}  // Add the missing 'title' property
      />
      <p className="mt-4">{videoData.description}</p>
    </div>
  );
}
