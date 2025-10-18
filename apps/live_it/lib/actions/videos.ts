"use server";

import { db } from "@liveit/db";
import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { z } from "zod"; 
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth"; 

export async function fetchVideos(userId: string) {
  return db.video.findMany({
    where: { userId },
    orderBy: { addedDate: "desc" },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      duration: true,
      url: true,
      addedDate: true,
      description: true,
      status: true,
    },
  });
}

export async function handleDelete(id: string) {
  //delete from s3
  const wrkrurl = process.env.WORKER_URL;
  console.log("request and worker url is ", { wrkrurl, id });
  const result = await axios.post(`${process.env.WORKER_URL}/delete-video`, { id });

  // console.log("Delete result:", result);
  if (result.status !== 200) {
    throw new Error("Failed to delete video from storage");
  }

  return result;
}

const s3Client = new S3Client({ region: process.env.AWS_REGION! });
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

const generateUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.union([
    z.string().startsWith("video/"), 
    z.string().startsWith("image/") 
  ]),
  userId: z.string().cuid(), 
});

export async function generatePresignedUploadUrl(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const rawData = {
      fileName: formData.get("fileName"),
      contentType: formData.get("contentType"),
      userId: session.user.id, 
  };

  const validation = generateUploadUrlSchema.safeParse(rawData);
  if (!validation.success) {
      throw new Error("Invalid input: " + validation.error.message);
  }
  const { fileName, contentType, userId } = validation.data;


  const uniqueVideoId = randomUUID();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_'); 
  const s3Key = `uploads/${userId}/${uniqueVideoId}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client as any, command as any, {
      expiresIn: 60 * 15, 
    });

    console.log(`Generated pre-signed URL for ${s3Key}`);
    return { success: true, url: signedUrl, key: s3Key };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return { success: false, error: "Could not generate upload URL." };
  }
}


export async function saveVideoMetadata(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }
  
    const s3Key = formData.get("s3Key") as string;
    const title = formData.get("title") as string;
    const thumbnailS3Key = formData.get("thumbnailS3Key") as string | null; 
    const userId = session.user.id;
  
    console.log("Saving metadata for", { s3Key, title, thumbnailS3Key, userId });
    if (!s3Key || !title) {
        throw new Error("Missing key or title");
    }

    try {
      const video = await db.video.create({
        data: {
          title: title,
          s3Key: s3Key,
          userId: userId,
          thumbnail: thumbnailS3Key,
        },
      });
      console.log(`Saved metadata for ${s3Key}`);
      return { success: true, video };
    } catch (error) {
        console.error("Error saving video metadata:", error);
        return { success: false, error: "Could not save video metadata." };
    }
}


