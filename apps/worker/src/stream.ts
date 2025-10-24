import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import os from 'os';
import { Writable } from 'stream'; // Import Writable for type checking
import { pipeline } from 'stream/promises'; // Import pipeline for efficient streaming

let ffmpegProcess: ReturnType<typeof spawn> | null = null;


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


const homeDir = os.homedir() || '/root'; // Get home directory or default to /root
const defaultDownloadDir = path.join(homeDir, 'video_downloads');

export async function downloadVideo(s3Key: string, outputDir = defaultDownloadDir): Promise<string> {
  if (!s3Key) throw new Error("❌ s3Key is required");

  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION!;

  // Basic check for environment variables
  if (!bucket || !region) {
    throw new Error("❌ AWS S3 Bucket or Region environment variable is not set.");
  }
  console.log(`🌍 S3 Bucket: ${bucket}, Region: ${region}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = path.basename(s3Key);
  const outputPath = path.join(outputDir, fileName);

  // Optional: Clean up existing file if present
  if (fs.existsSync(outputPath)) {
    console.warn(`⚠️ Deleting existing file at ${outputPath}`);
    try {
      fs.unlinkSync(outputPath);
    } catch (unlinkErr) {
      console.error(`Error deleting existing file: ${unlinkErr}`);
      // Decide if this is a fatal error or if you can continue
    }
  }

  // Generate presigned URL (valid 1 hour)
  const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
  const s3Url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  console.log(`⬇️ Downloading from S3: ${s3Url}`);

  // Fetch the video
  const response = await fetch(s3Url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }
  if (!response.body) {
    throw new Error("❌ Response body is null, cannot download.");
  }

  // --- Stream the download directly to the file ---
  const fileStream = fs.createWriteStream(outputPath);

  try {
    // Pipe the response body (ReadableStream) into the file stream (Writable)
    // Ensure response.body is compatible with Node.js Writable stream
    // @ts-ignore - Node's fetch response.body should be pipeable to fs.createWriteStream
    await pipeline(response.body, fileStream);

    console.log(`✅ Downloaded video to ${outputPath}`);
    return outputPath;
  } catch (streamError) {
    console.error("❌ Error during file stream write:", streamError);
    // Attempt to clean up the partial file on error
    try {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`🧹 Cleaned up partial file: ${outputPath}`);
      }
    } catch (cleanupErr) {
      console.error(`Error cleaning up partial file: ${cleanupErr}`);
    }
    // Re-throw the error to indicate download failure
    throw new Error(`Failed to write video to disk: ${streamError}`);
  }
}

export function startStreaming(id: string, streamKey: string, inputFile: string) {
  console.log(`🎥 Starting FFmpeg stream from ${inputFile} ...`);

  ffmpegProcess = spawn("ffmpeg", [
    "-re",                   // Read the input at its native frame rate (important for streaming)
    "-stream_loop", "-1",    // Loop the video infinitely
    "-i", inputFile,         // Your source video
    "-c:v", "copy",          // ❗ Key Change: Copy the video stream directly
    "-c:a", "copy",          // ❗ Key Change: Copy the audio stream directly
    "-f", "flv",             // The container format YouTube expects
    `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
  ]);

  // const ffmpegArgs = [
  //   "-re",                   // Read input at native frame rate
  //   "-stream_loop", "-1",    // Loop the video infinitely
  //   "-i", inputFile,         // Input file

  //   // --- Video Re-encoding, Scaling & Bitrate Control ---
  //   "-c:v", "libx264",       // Re-encode video using H.264
  //   "-preset", "veryfast",   // Faster encoding preset (lower quality, less CPU)
  //   "-vf", "scale=2560:1440", // Scale video filter to 2560x1440
  //   "-b:v", "6000k",         // Target video bitrate (6000 Kbps = 6 Mbps)
  //   "-maxrate", "6800k",     // **Set max bitrate to YouTube's recommendation**
  //   "-bufsize", "12000k",    // Buffer size (often ~2x bitrate)
  //   "-pix_fmt", "yuv420p",   // Standard pixel format
  //   "-g", "50",              // Keyframe interval (~2 seconds for 25/30fps)

  //   // --- Audio ---
  //   "-c:a", "copy",          // Try copying audio first (saves CPU)
  //   // If audio copy fails, re-encode:
  //   // "-c:a", "aac",
  //   // "-b:a", "128k",

  //   // --- Output ---
  //   "-f", "flv",             // Output format for RTMP
  //   `rtmp://a.rtmp.youtube.com/live2/${streamKey}`, // YouTube ingest URL
  // ];

  // const ffmpegProcess = spawn("ffmpeg", ffmpegArgs);

  ffmpegProcess?.stderr?.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data.toString()}`);
  });

  activeStreams.set(id, { ffmpegProcess, filePath: inputFile });

  ffmpegProcess.on('error', (err) => {
    console.error('Failed to start FFmpeg process:', err);
  });

  ffmpegProcess.on("close", code => console.log(`FFmpeg id- ${id} exited with code ${code}`));
}

function cleanupFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
    console.log(`🧹 Deleted temp file: ${filePath}`);
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

export async function killStreaming(id: string) {
  try {
    const streamCurrent = activeStreams.get(id);

    if (streamCurrent) {
      streamCurrent.ffmpegProcess.kill("SIGKILL");
      activeStreams.delete(id);
      console.log(`Stream ${id} stopped`);

      setTimeout(() => {
        cleanupFile(streamCurrent.filePath); 
      }, 5000);

    } else {
      console.log(`Stream ${id} not found, it might be already stopped.`);
    }

  } catch (error) {
    console.error("Error stopping stream:", error);
    throw error;
  }
}