"use server";

import { db } from "@liveit/db";
import axios from "axios";

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