// app/api/download/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { promisify } from "util";
import { randomUUID } from "crypto";

const unlink = promisify(fs.unlink);
const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  const { videoId } = await req.json();
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const tmpPath = path.join(os.tmpdir(), `${randomUUID()}.mp4`);

  // 1) Download via yt-dlp
  await new Promise<void>((resolve, reject) => {
    const args = ["-f", "best[ext=mp4]/best", "-o", tmpPath, videoUrl];
    const yt = spawn("yt-dlp", args);

    yt.stderr?.on("data", d => console.log("[yt-dlp]", d.toString()));
    yt.on("close", code => (code === 0 ? resolve() : reject(new Error(`yt-dlp failed ${code}`))));
    yt.on("error", err => reject(err));
  });

  // 2) Upload to S3
  const key = `uploads/${videoId}-${Date.now()}.mp4`;
  const fileStream = fs.createReadStream(tmpPath);

  const upload = new Upload({
    client: s3,
    params: { Bucket: process.env.S3_BUCKET!, Key: key, Body: fileStream },
  });

  await upload.done();

  // 3) Cleanup
  try {
    await unlink(tmpPath);
  } catch {}

  return NextResponse.json({ success: true, s3Key: key });
}
