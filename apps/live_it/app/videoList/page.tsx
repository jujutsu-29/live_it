// apps/dashboard/app/videos/[userId].tsx
"use client";
import { useEffect, useState } from "react";

type Video = {
  id: string;
  title: string;
  previewUrl: string;
  thumbnailUrl: string;
  duration: number;
};

export default function UserVideos({ userId }: { userId: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/videos/${userId}`);
      const data = await res.json();
      setVideos(data);
      setLoading(false);
    })();
  }, [userId]);

  // if (loading) return <p>Loading videos...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map(video => (
        <div key={video.id} className="border rounded p-2">
          <h3 className="font-bold">{video.title}</h3>
          <video
            controls
            width="100%"
            src={video.previewUrl}
            poster={video.thumbnailUrl}
          />
          <p>Duration: {video.duration}s</p>
        </div>
      ))}
    </div>
  );
}
