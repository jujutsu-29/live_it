"use server";

import { db } from "@liveit/db";

export const getUserStreamKey = async (userId: string) => {
    if(!userId) return null;
    return db.user.findUnique({
        where: { id: userId },
        select: {
            streamKey: true,
        },
    });
}