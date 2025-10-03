"use server";

import { db } from "@liveit/db";

export async function fetchVideos(userId: string) {
  return db.video.findMany({
    where: { userId },
    orderBy: { addedDate: "desc" },
  });
}
