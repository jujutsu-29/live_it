import { NextResponse } from "next/server";
import { db } from "@liveit/db";

export async function POST(req: Request) {
  const { userId, videoUrl } = await req.json();

  if (!userId || !videoUrl) {
    return NextResponse.json({ error: "userId and videoUrl required" }, { status: 400 });
  }

  // 1️⃣ Insert job into DB
  const result = await db.videoJob.create({
    data: {
      userId: userId,
      videoUrl: videoUrl,
      status: "pending",
    },
  });

  // 2️⃣ Return job ID immediately
  return NextResponse.json({ success: true, jobId: result.id });
}
