import { spawn } from "child_process";

const inputFile = "F:\\projects\\live_it\\apps\\worker\\dist\\07ac69bc-7798-4162-a267-90f0ab941048.mp4";
const streamKey = "z6xz-w1ch-874z-v32f-013s";

function startStreaming() {
  const ffmpeg = spawn("ffmpeg", [
    "-re",
    "-stream_loop", "-1", // ♾️ Infinite loop
    "-i", inputFile,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-maxrate", "3000k",
    "-bufsize", "6000k",
    "-pix_fmt", "yuv420p",
    "-g", "50",
    "-c:a", "aac",
    "-b:a", "160k",
    "-ar", "44100",
    "-f", "flv",
    `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
  ]);

  ffmpeg.stderr.on("data", data => console.log(data.toString()));
  ffmpeg.on("close", code => console.log(`FFmpeg exited with code ${code}`));
}

startStreaming();
