import { NextResponse } from "next/server";
import { db } from "@liveit/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getVideoDetails } from "@/lib/utils";


export async function POST(req: Request) {

  const session = await auth();
  const user = session?.user

  if (!user || user.id === undefined) {
    return redirect('/signin')
  }

  const { videoUrl } = await req.json();
  // console.log("Received video URL:", videoUrl);
  const videoData = getVideoDetails(videoUrl);
  console.log("Extracted video data:", videoData);


  if (!videoUrl) {
    return NextResponse.json({ error: "video URL required" }, { status: 400 });
  }

  try {
    await db.videoJob.create({
      data: {
        userId: user?.id,
        videoUrl,
        status: "pending",
      },
    });

    await db.Video.create({
      data: {
        url: videoUrl,
        title: videoData.title,
        thumbnail: videoData.thumbnailUrl,
      },
    });

  return NextResponse.json({ success: true });
} catch (e) {
  console.log("Failed to update db with url", e);
  return NextResponse.json({ error: "Failed to update db with url" }, { status: 500 });
}
}
