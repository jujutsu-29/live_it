import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@liveit/db";

const s3 = new S3Client({ region: process.env.AWS_REGION! });

async function processJob(job: any) {
  const videoUrl = job.video_url;
  const videoId = ytdl.getURLVideoID(videoUrl);
  const filePath = path.resolve(__dirname, `${videoId}.mp4`);

  try {
    // Update status
    await db.videoJob.update({
      where: { id: job.id },
      data: { status: "processing" },
    });

    // Download video
    await new Promise<void>((resolve, reject) => {
      ytdl(videoUrl, { quality: "highest" })
        .pipe(fs.createWriteStream(filePath))
        .on("finish", () => resolve())
        .on("error", reject);
    });

    // Upload to S3
    const key = `uploads/${videoId}-${Date.now()}.mp4`;
    const fileStream = fs.createReadStream(filePath);
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: fileStream, ContentType: "video/mp4" }));

    // Update job as done
    await db.videoJob.update({
      where: { id: job.id },
      data: { status: "done", s3Key: key },
    });

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
    processJob(job); // process independently
  }
}, 5000); // every 5s
