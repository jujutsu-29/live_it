import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

// const inputFile = "F:\\projects\\live_it\\apps\\worker\\dist\\07ac69bc-7798-4162-a267-90f0ab941048.mp4";
// const streamKey = "z6xz-w1ch-874z-v32f-013s";
// const streamKey = "t956-r8yt-pstg-vz4f-32d6";

// export function startStreaming(streamKey: string, inputFile: string) {
//   const ffmpeg = spawn("ffmpeg", [
//     "-re",
//     "-stream_loop", "-1", // ♾️ Infinite loop
//     "-i", inputFile,
//     "-c:v", "libx264",
//     "-preset", "veryfast",
//     "-maxrate", "3000k",
//     "-bufsize", "6000k",
//     "-pix_fmt", "yuv420p",
//     "-g", "50",
//     "-c:a", "aac",
//     "-b:a", "160k",
//     "-ar", "44100",
//     "-f", "flv",
//     `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
//   ]);

//   ffmpeg.stderr.on("data", data => console.log(data.toString()));
//   ffmpeg.on("close", code => console.log(`FFmpeg exited with code ${code}`));
// }

// startStreaming();




let ffmpegProcess: ReturnType<typeof spawn> | null = null;

/**
 * Step 1: Download video to local droplet
 */
// export async function downloadVideo(s3Key: string, outputDir = "/tmp") {
//   if(!s3Key) throw new Error("s3Url is required");
//   const fileName = path.basename(s3Key); // remove query if presigned URL
//   const outputPath = path.join(outputDir, fileName);

//   const res = await fetch(s3Url);
//   if (!res.ok) throw new Error(`Failed to download video: ${res.statusText}`);

//   const fileStream = fs.createWriteStream(outputPath);
//   await new Promise<void>((resolve, reject) => {
//     res.body?.pipe(fileStream);
//     res.body?.on("error", reject);
//     fileStream.on("finish", resolve);
//   });

//   console.log(`✅ Downloaded video to ${outputPath}`);
//   return outputPath;
// }


import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface StreamData {
  ffmpegProcess: ChildProcess;
  filePath: string;
}

const activeStreams = new Map<string, StreamData>();

export async function downloadVideo(s3Key: string, outputDir = "/tmp") {
  if (!s3Key) throw new Error("❌ s3Key is required");

  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION!;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = path.basename(s3Key);
  const outputPath = path.join(outputDir, fileName);

  // 🧠 Generate presigned URL (valid 1 hour)
  const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
  const s3Url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  console.log(`⬇️ Downloading from S3: ${s3Url}`);

  // 🧱 Stream the response and write to file
  const response = await fetch(s3Url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));

  console.log(`✅ Downloaded video to ${outputPath}`);
  return outputPath;
}

// const activeStreams = new Map<string, ChildProcess>();

/**
 * Step 2: Start streaming to YouTube
 */
export function startStreaming(id: string, streamKey: string, inputFile: string) {
  console.log(`🎥 Starting FFmpeg stream from ${inputFile} ...`);

  // ffmpegProcess = spawn("ffmpeg", [
  //   "-re",
  //   "-stream_loop", "-1", // ♾️ loop video
  //   "-i", inputFile,
  //   "-c:v", "libx264",
  //   "-preset", "veryfast",
  //   "-maxrate", "3000k",
  //   "-bufsize", "6000k",
  //   "-pix_fmt", "yuv420p",
  //   "-g", "50",
  //   "-c:a", "aac",
  //   "-b:a", "160k",
  //   "-ar", "44100",
  //   "-f", "flv",
  //   `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
  // ]);

  ffmpegProcess = spawn("ffmpeg", [
  "-re",                   // Read the input at its native frame rate (important for streaming)
  "-stream_loop", "-1",    // Loop the video infinitely
  "-i", inputFile,         // Your source video
  "-c:v", "copy",          // ❗ Key Change: Copy the video stream directly
  "-c:a", "copy",          // ❗ Key Change: Copy the audio stream directly
  "-f", "flv",             // The container format YouTube expects
  `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
]);

  // ffmpegProcess.stderr.on("data", data => console.log(data.toString()));
  activeStreams.set(id, { ffmpegProcess, filePath: inputFile });
  ffmpegProcess.on("close", code => console.log(`FFmpeg exited with code ${code}`));
}

/**
 * Step 3: Clean up file when stopped
 */
function cleanupFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
    console.log(`🧹 Deleted temp file: ${filePath}`);
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

// export async function killStreaming(id: string) {
//   try {
//     const streamCurrent = activeStreams.get(id);
//     if (streamCurrent) {
//       streamCurrent.ffmpegProcess.kill("SIGINT");
//       activeStreams.delete(id);
//       console.log(`Stream ${id} stopped`);
//     }

//     setTimeout(() => {
//     cleanupFile(`${streamCurrent?.filePath}`);      
//     }, 5000);
//   } catch (error) {
//     console.error("Error stopping stream:", error);
//     throw error;
//   }
// }

export async function killStreaming(id: string) {
  try {
    const streamCurrent = activeStreams.get(id);

    if (streamCurrent) {
      // 1. Use SIGKILL to force the process to stop
      streamCurrent.ffmpegProcess.kill("SIGKILL");
      activeStreams.delete(id);
      console.log(`Stream ${id} stopped`);

      // 2. Move the cleanup logic INSIDE the 'if' block
      setTimeout(() => {
        cleanupFile(streamCurrent.filePath); // No need for template literal or optional chaining now
      }, 5000);

    } else {
      // Add a log for when no stream is found (optional, but good for debugging)
      console.log(`Stream ${id} not found, it might be already stopped.`);
    }

  } catch (error) {
    console.error("Error stopping stream:", error);
    throw error;
  }
}
