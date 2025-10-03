// import { NextResponse } from "next/server";
// import { db } from "@liveit/db";
// import { redirect } from "next/navigation";
// import { auth } from "@/lib/auth";
// import { getVideoDetails } from "@/lib/utils";


// export async function POST(req: Request) {

//   const session = await auth();
//   const user = session?.user

//   if (!user || user.id === undefined) {
//     return redirect('/signin')
//   }

//   const { videoUrl } = await req.json();
//   // console.log("Received video URL:", videoUrl);
//   const videoData = getVideoDetails(videoUrl);
//   console.log("Extracted video data:", videoData);


//   if (!videoUrl) {
//     return NextResponse.json({ error: "video URL required" }, { status: 400 });
//   }

//   try {
//     await db.VideoJob.create({
//       data: {
//         userId: user?.id,
//         videoUrl,
//         status: "pending",
//       },
//     });

//     await db.Video.create({
//       data: {
//         url: videoUrl,
//         title: videoData.title,
//         thumbnail: videoData.thumbnailUrl,
//       },
//     });

//   return NextResponse.json({ success: true });
// } catch (e) {
//   console.log("Failed to update db with url", e);
//   return NextResponse.json({ error: "Failed to update db with url" }, { status: 500 });
// }
// }



import { NextResponse } from "next/server";
import { db } from "@liveit/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getVideoDetails } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user || user.id === undefined) {
    return redirect("/signin");
  }

  const { videoUrl } = await req.json();
  const videoData = getVideoDetails(videoUrl);

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
