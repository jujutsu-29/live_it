import { NextResponse } from "next/server";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { promisify } from "util";
import { randomUUID } from "crypto";
import { db } from "@liveit/db";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const unlink = promisify(fs.unlink);
const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {

  const session = await auth();
  const user = session?.user
  
  if(!user || user.id === undefined) {
    return redirect('/signin')
  }

  const { videoUrl } = await req.json();
  if (!videoUrl) {
    return NextResponse.json({ error: "video URL required" }, { status: 400 });
  }

  try {
    await db.videoJob.create({
      data: {
        userId: user?.id ?? "55",
        videoUrl,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("Failed to update db with url", e);
    return NextResponse.json({ error: "Failed to update db with url" }, { status: 500 });
  }
}
