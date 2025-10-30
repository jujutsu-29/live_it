import { db } from "@liveit/db";
import express from "express";
import { deleteVideoFromS3 } from "./processingJob.js";
// import { getVideoMetadata } from "./videoMetadata.js";
import cors from "cors";
import { downloadVideo, killStreaming, startStreaming } from "./stream.js";
import { addStreamJob } from "./queue.js";

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


interface StreamJob {
  id: string;        // Video ID
  s3Key: string;
  streamKey: string;
}

app.post("/start-stream", async (req, res) => {
  try {
    const { id, streamKey } = req.body;
    if (!id || !streamKey) {
      return res.status(400).json({ error: "Missing id or streamKey" });
    }

    const video = await db.video.findUnique({ where: { id } });
    if (!video || !video.s3Key) {
      return res.status(404).json({ error: "Video not found or S3 key missing" });
    }

    // Prepare the job data
    const jobData: StreamJob = {
      id: video.id,
      s3Key: video.s3Key,
      streamKey: streamKey // Pass the actual streamKey
    };

    // Add the job to the queue
    addStreamJob(jobData);

    // Immediately respond to the client
    return res.status(202).json({ status: "processing_started", message: "Stream processing has been queued." });

  } catch (error) {
    console.error("Error in /start-stream:", error);
    res.status(500).json({ error: "Failed to queue stream job." });
  }
});


app.post("/stop-stream", async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Request to stop stream for video job ID:", id);
    if (!id) return res.status(400).json({ error: "Missing id" });
    console.log(`🛑 Stopping stream for video job ID: ${id}`);
    killStreaming(id);

    await db.video.updateMany({
      where: { id: id },
      data: { status: 'stopped', live_stoppedAt: new Date() },
    });
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

