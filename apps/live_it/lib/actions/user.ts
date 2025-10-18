"use server";

import { db } from "@liveit/db";
import crypto from "crypto";
import { encrypt } from "./crypto";

export const getUserStreamKey = async (userId: string) => {
    if(!userId) return null;
    return db.user.findUnique({
        where: { id: userId },
        select: {
            streamKey: true,
        },
    });
}

export const updateProfile = async (profile: {
    streamKey: string | null;
    youtubeUserName: string | null;
}, userId: string) => {
    if(!userId) return null;

    let encryptStreamKey;

    if(profile.streamKey) {
        encryptStreamKey = await encrypt(profile.streamKey);
    }
    return db.user.update({
        where: { id: userId },
        data: {
            streamKey: encryptStreamKey,
            youtubeUserName: profile.youtubeUserName,
        },
    });
}
