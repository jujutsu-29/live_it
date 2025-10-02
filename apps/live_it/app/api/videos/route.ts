// packages/api/src/routes/videos.ts
import { db } from "@liveit/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

export async function getUserVideos(userId: string) {
  // fetch videos uploaded by user
  const videos = await db.videoJob.findMany({
    where: { userId },
    select: {
      id: true,
    //   title: true,
      s3Key: true,
    //   duration: true,
    //   thumbnailUrl: true
    },
  });

  // map videos to include CloudFront signed URL
  const videosWithUrls = videos.map(video => {
    if (!video.s3Key) return video;

    const signedUrl = getSignedUrl({
      url: `https://${process.env.CF_DOMAIN}/${video.s3Key}`,
      keyPairId: process.env.CF_KEY_PAIR_ID!,
      privateKey: process.env.CF_PRIVATE_KEY!,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    });

    return {
      ...video,
      previewUrl: signedUrl,
    };
  });

  return videosWithUrls;
}
