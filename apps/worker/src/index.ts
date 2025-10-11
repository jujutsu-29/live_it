import { db } from "@liveit/db";
import express from "express";
import { deleteVideoFromS3, processJob } from "./processingJob.js";
import { getVideoMetadata } from "./videoMetadata.js";
import cors from "cors";
import { downloadVideo, killStreaming, startStreaming } from "./stream.js";

const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
}));


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Worker listening on port ${PORT}`);
});

app.post("/process-job", async (req, res) => {
  // console.log("Received job:", req);
  // console.log("Received job:", req.body);
  const { userId, videoUrl } = req.body;

  try {
    const videoData = await getVideoMetadata(videoUrl);

    const video = await db.video.create({
      data: {
        userId: userId,
        url: videoUrl,
        title: videoData.title,
        thumbnail: videoData.thumbnailUrl,
        duration: videoData.duration
      },
    });

    //no await here video download and upload will happen on background, we dont want to keep user waiting
    // processJob(videoUrl, video.id);

    setImmediate(() => {
      processJob(videoUrl, video.id).catch(err => {
        console.error(`Background job failed for ${video.id}:`, err);
      });
    });
    return res.status(200).json({ message: "Job processing Done", data: video });
  } catch (err) {
    console.error("Error processing job:", err);
    return res.status(500).send("Error processing job");
  }

})

app.post("/delete-video", async (req, res) => {
  // console.log("Delete request is ", req);
  const id = req.body.id;
  // console.log("request body is ", req.body.id);
  console.log("Delete request for video ID:", id);
  if (!id) {
    return res.status(400).send("Video ID is required");
  }

  try {
    const video = await db.video.findUnique({ where: { id: id } });
    // if (!video) return res.status(404).json({ error: "Video not found" });
    console.log("video found sir ji ", video);
    if (video?.s3Key) {
      console.log("Deleting video from S3 with key:", video.s3Key);
      const resultAWS = await deleteVideoFromS3(video.s3Key);
      console.log(`Deleted video ${id} from S3`, resultAWS);
    }

    await db.video.delete({ where: { id: id } });
    console.log(`Deleted video ${id} from DB`);
    return res.status(200).json({ message: "Video deleted successfully" });

  } catch (error) {
    console.error("Error deleting video:", error);
    return res.status(500).send("Error deleting video");
  }
})

app.post("/start-stream", async (req, res) => {
  try {
    const { s3Key, streamKey } = req.body;
    if (!s3Key || !streamKey)
      return res.status(400).json({ error: "Missing s3Key or streamKey" });

    // Step 1: Download video
    const localPath = await downloadVideo(s3Key);

    // Step 2: Start streaming
    startStreaming(streamKey, localPath);

    return res.json({ status: "streaming started", localPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/stop-stream", async (req, res) => {
  try {
    killStreaming();
    return res.json({ status: "stream stopped" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to stop stream" });
  }
});

app.listen(4000, () => console.log("🎬 Worker running on port 4000"));

app.get("/", (req, res) => {
  res.send("Worker is running");
});

