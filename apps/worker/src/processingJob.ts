  // import { YtDlp } from "ytdlp-nodejs";
  import fs from "fs";
  import path from "path";
  import { fileURLToPath } from "url";
  import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
  import { db } from "@liveit/db";
  import dotenv from "dotenv";
  import { randomUUID } from "crypto";

  // const ytdlp = new YtDlp();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

  const s3 = new S3Client({ region: process.env.AWS_REGION! });

  export async function processJob(videoUrl: string, videoId: string) {
    const uniqueVideoId = randomUUID();
    const filePath = path.resolve(__dirname, `${uniqueVideoId}.mp4`);
    const s3Key = `uploads/${uniqueVideoId}-${Date.now()}.mp4`;

    let result: { id: string } | null = null;

    // try {
    //   // Download video
    //   console.log(`Downloading: ${videoUrl}`);
    //   await ytdlp.downloadAsync(videoUrl, {
    //     output: filePath,
    //     recodeVideo: "mp4",
    //     onProgress: (p) => console.log(p),
    //   });

    //   // Upload to S3
    //   console.log("Uploading to S3...");
    //   const fileStream = fs.createReadStream(filePath);
    //   await s3.send(
    //     new PutObjectCommand({
    //       Bucket: process.env.AWS_S3_BUCKET!,
    //       Key: s3Key,
    //       Body: fileStream,
    //       ContentType: "video/mp4",
    //     })
    //   );
    //   console.log("✅ Upload complete");

    //   // Update DB
    //   const dbResult = await db.videoJob.create({
    //     data: {
    //       status: "done",
    //       s3Key: s3Key,
    //       videoId: videoId,
    //     },
    //   });

    //   const videoUpdated = await db.video.update({
    //     where: { id: videoId },
    //     data: { s3Key: s3Key },
    //   });
    //   console.log("DB updated:", videoUpdated);
    //   result = { id: dbResult.id.toString() };

    //   console.log(`✅ Job ${result.id} completed.`);

    // } catch (err: any) {
    //   console.error(`❌ Job with videoId ${videoId} failed:`, err);

    //   // Only update if DB record exists
    //   if (result?.id) {
    //     await db.videoJob.update({
    //       where: { id: Number(result.id) },
    //       data: { status: "failed" },
    //     });
    //   }
    // } finally {
    //   // Always clean up local files
    //   if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
    // }
  }

  export async function deleteVideoFromS3(s3Key: string) {
    if(!s3Key){
      console.warn("No S3 key provided for deletion.");
      return;
    }
    try{
      const result = await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      }));
      console.log("result after deleting video from s3 is ", result);
      console.log(`✅ Deleted ${s3Key} from S3`);
    }catch(err){
      console.error(`❌ Failed to delete ${s3Key} from S3:`, err);
    }
    }
