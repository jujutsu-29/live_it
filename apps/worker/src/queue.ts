import { db } from '@liveit/db'; 
import { downloadVideo, startStreaming } from './stream.js';

interface StreamJob {
  id: string;        // Video ID
  s3Key: string;
  streamKey: string;
}

// Simple in-memory queue array
const jobQueue: StreamJob[] = [];
let isProcessing = false; // Flag to prevent processing multiple jobs at once

// Function to add a job to the queue
export function addStreamJob(job: StreamJob) {
  jobQueue.push(job);
  console.log(`📥 Added job for video ${job.id} to queue. Queue size: ${jobQueue.length}`);
  // Start processing if not already running
  processQueue(); 
}

// Function to process the next job in the queue
async function processQueue() {
  if (isProcessing || jobQueue.length === 0) {
    return; // Don't process if already busy or queue is empty
  }

  isProcessing = true;
  const job = jobQueue.shift(); // Get the next job (FIFO)

  if (!job) {
    isProcessing = false;
    return; 
  }

  console.log(`🛠️ Processing job for video ${job.id}...`);

  try {
    // --- The actual long-running work ---
    console.log(`⬇️ Downloading video for job ${job.id}...`);
    const localPath = await downloadVideo(job.s3Key);

    console.log(`▶️ Starting stream for job ${job.id}...`);
    // Pass the actual streamKey here
    startStreaming(job.id, job.streamKey, localPath); 

    await db.video.updateMany({
      where: { id: job.id },
      data: { status: 'streaming', live_startedAt: new Date() },
    });
    console.log(`✅ Job completed for video ${job.id}.`);
    // --- Work finished ---

  } catch (error) {
    console.error(`❌ Job failed for video ${job.id}:`, error);
    // Optionally update DB status to 'failed'
    try {
      await db.video.updateMany({
        where: { id: job.id },
        data: { status: 'failed' }, // Mark as failed
      });
    } catch (dbError) {
      console.error(`Failed to update status to 'failed' for video ${job.id}:`, dbError);
    }
  } finally {
    isProcessing = false; // Release the lock
    // Check if there are more jobs
    setTimeout(processQueue, 1000); // Check again after a short delay
  }
}

// // Optional: Start processing automatically when the server starts
// // (Call this once in your main server file)
// export function startQueueWorker() {
//     console.log("🚀 Queue worker started.");
//     processQueue();
// }