import { NextResponse } from "next/server";
import { db } from "@liveit/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getVideoMetadata } from "@/lib/videos";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user || user.id === undefined) {
    return redirect("/signin");
  }

  const { videoUrl } = await req.json();
  const videoData = await getVideoMetadata(videoUrl);

  if (!videoUrl) {
    return NextResponse.json({ error: "video URL required" }, { status: 400 });
  }

  try {
    // 1️⃣ Create a Video record
    const video = await db.video.create({
      data: {
        userId: user.id,
        url: videoUrl,
        title: videoData.title,
        thumbnail: videoData.thumbnailUrl,
        duration: videoData.duration
      },
    });

    // 2️⃣ Create a VideoJob linked to the Video
    await db.videoJob.create({
      data: {
        videoId: video.id,   // ✅ references the created Video
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to update db with url", e);
    return NextResponse.json(
      { error: "Failed to update db with url" },
      { status: 500 }
    );
  }
}
