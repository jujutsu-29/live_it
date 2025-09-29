// import ytdl from "ytdl-core";
// import ytdl from '@distube/ytdl-core';
import { YtDlp } from 'ytdlp-nodejs';

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@liveit/db";
import dotenv from "dotenv";



const ytdlp = new YtDlp();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
const s3 = new S3Client({ region: process.env.AWS_REGION! });

async function processJob(job: any) {
  console.log("job thing is ", job);
  const videoUrl = job.videoUrl;

  if (!videoUrl) {
    console.error(`❌ Job ${job.id} has no video URL.`);
    await db.videoJob.update({
      where: { id: job.id },
      data: { status: "failed" },
    });
    return;
  }
  let cleanUrl = videoUrl.split("&")[0];
  // const videoId = ytdl.getURLVideoID(videoUrl);

  let videoId;
  try {
    // videoId = ytdl.getURLVideoID(cleanUrl);
    videoId = 2;
  } catch {
    console.error(`Invalid video URL: ${cleanUrl}`);
    await db.videoJob.update({ where: { id: job.id }, data: { status: "failed" } });
    return;
  }
  const filePath = path.resolve(__dirname, `${videoId}.mp4`);

  try {
    console.log(`Starting job ${job.id} for db from pending to processing`);
    // Update status
    await db.videoJob.update({
      where: { id: job.id },
      data: { status: "processing" },
    });

    // Download video
    console.log(`Processing job ${job.id} - downloading video...`);

    const ytdlpArgs = [
      '-o', filePath,
      '--recode-video', 'mp4'
    ];

    try {
      const output = await ytdlp.downloadAsync(cleanUrl, {
        output: filePath,
        recodeVideo: 'mp4',
        onProgress: (progress) => console.log(progress),
    });

      console.log('Download completed:', output);
    } catch (error) {
      console.error('Error:', error);
    }
    // Upload to S3
    console.log("Uploading to S3...");
    const key = `uploads/${videoId}-${Date.now()}.mp4`;
    const fileStream = fs.createReadStream(filePath);
    await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key, Body: fileStream, ContentType: "video/mp4" }));
    console.log("Upload complete.");
    // Update job as done
    await db.videoJob.update({
      where: { id: job.id },
      data: { status: "done", s3Key: key },
    });
    console.log("Cleaning up local file...");
    fs.unlinkSync(filePath);
    console.log(`✅ Job ${job.id} completed.`);
  } catch (err) {
    await db.videoJob.update({ where: { id: job.id }, data: { status: "failed" } });
    console.error(`❌ Job ${job.id} failed:`, err);
  }
}

// Poll DB for new jobs
setInterval(async () => {
  const jobs = await db.videoJob.findMany({ where: { status: "pending" } });
  for (const job of jobs) {
    console.log(`🔄 Processing job ${job.id}... before function call`);
    processJob(job); // process independently
  }
}, 5000); // every 5s
