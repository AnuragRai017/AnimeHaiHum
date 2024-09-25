export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface Video {
    id: number;
    title: string;
    description: string;
    video_file_url: string;
  }
  
  export interface WatchHistory {
    video_id: number;
    last_position: number;
  }
  