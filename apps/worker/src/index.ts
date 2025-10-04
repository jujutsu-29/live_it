import { db } from "@liveit/db";
import express from "express";
import { processJob } from "./processingJob.js";
import { getVideoMetadata } from "./videoMetadata.js";
import cors from "cors";

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
  const {userId, videoUrl} = req.body;

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

    await processJob(videoUrl, video.id);

  } catch (err) {
    console.error("Error processing job:", err);
    return res.status(500).send("Error processing job");
  }

  res.status(200).send("Job processing Done");
})



