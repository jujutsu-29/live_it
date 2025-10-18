// app/video-library/page.tsx
// This is the main page file, acting as a Server Component

import VideoLibraryClientPage from './VideoLibraryClientPage'; // Import the client component

// This Server Component reads server-only environment variables
export default async function VideoLibraryPageWrapper() {
  const bucketName = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;

  // console.log("Server-side S3 Bucket:", bucketName);
  //   console.log("Server-side AWS Region:", region);
  // Basic check for server-side variables
  if (!bucketName || !region) {
    console.error("SERVER ERROR: Missing AWS_S3_BUCKET or AWS_REGION environment variables.");
    // Return an error state or component
    return <div>Server configuration error: S3 bucket/region not set.</div>;
  }

  // Pass the variables as props to the Client Component
  return <VideoLibraryClientPage s3BucketName={bucketName} s3Region={region} />;
}