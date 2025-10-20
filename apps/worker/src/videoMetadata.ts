// import { YtDlp } from "ytdlp-nodejs";

export type VideoMetadata = {
  title: string;
  thumbnailUrl: string;
  duration: number;
};

export async function getVideoMetadata(videoUrl: string): Promise<VideoMetadata> {
  // const ytdlp = new YtDlp({
  //   binaryPath: process.env.YTDLP_PATH, // optional if you bundled binary
  // });

  // const ok = await ytdlp.checkInstallationAsync();
  // if (!ok) throw new Error("yt-dlp not installed on worker");

  // const stdout = await ytdlp.execAsync(videoUrl, {
  //   dumpSingleJson: true,
  //   noCheckCertificates: true,
  //   noWarnings: true,
  //   noDownload: true,
  // });

  // let meta: any;
  // try {
  //   meta = JSON.parse(stdout);
  // } catch (err) {
  //   console.error("Failed to parse yt-dlp JSON:", stdout);
  //   throw new Error("Invalid yt-dlp output");
  // }

  // const title = meta.title;
  // const duration = meta.duration;
  // let thumbnailUrl = meta.thumbnail || "";

  // if (Array.isArray(meta.thumbnails) && meta.thumbnails.length > 0) {
  //   thumbnailUrl = meta.thumbnails.at(-1).url;
  // }

  return { title: "random", thumbnailUrl: "random", duration: 29 };
}
