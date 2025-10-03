import { YtDlp } from 'ytdlp-nodejs';

type VideoMetadata = {
  title: string;
  thumbnailUrl: string;
  duration: number;           
};

export async function getVideoMetadata(videoUrl: string): Promise<VideoMetadata> {
  const ytdlp = new YtDlp();

  // Ensure binary is installed (optional, for safety)
  const ok = await ytdlp.checkInstallationAsync();  
  if (!ok) {
    throw new Error("yt-dlp binary not installed or not found");
  }

  // Execute with JSON dump, skip actual download
  const stdout = await ytdlp.execAsync(videoUrl, {
    // pass flags to yt-dlp
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    // skip download flag
    noDownload: true,  // if supported by wrapper / passes `--no-download` to yt-dlp
  });

  let meta: any;
  try {
    meta = JSON.parse(stdout);
  } catch (err) {
    console.error("Failed to parse yt-dlp JSON:", stdout, err);
    throw new Error("Failed to parse video metadata");
  }

  // Extract fields
  const title: string = meta.title;
  const duration: number = meta.duration; // duration in seconds
  // Try to pick a good thumbnail:
  let thumbnailUrl: string = "";
  if (Array.isArray(meta.thumbnails) && meta.thumbnails.length > 0) {
    // choose the last (highest quality), or find by some logic
    thumbnailUrl = meta.thumbnails[meta.thumbnails.length - 1].url;
  } else if (meta.thumbnail) {
    thumbnailUrl = meta.thumbnail;
  }

  return {
    title,
    thumbnailUrl,
    duration
  };
}
