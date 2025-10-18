"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Upload, CheckCircle2 } from "lucide-react"
import { generatePresignedUploadUrl, saveVideoMetadata } from "@/lib/actions/videos"

interface VideoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: (video: any) => void
  userId: string
}

const ALLOWED_FORMATS = ["video/mp4", "video/webm", "video/quicktime"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 // 5GB
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov"]

export function VideoUploadDialog({ open, onOpenChange, onUploadSuccess, userId }: VideoUploadDialogProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}`,
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5GB limit. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`,
      }
    }

    return { valid: true }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const validation = validateFile(file)

      if (!validation.valid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive" as any,
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const file = files[0]
      const validation = validateFile(file)

      if (!validation.valid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive" as any,
        })
        return
      }

      setSelectedFile(file)
    }
  }

  async function generateThumbnail(file: File, timeInSeconds: number = 1): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Could not get canvas context"));
      }

      video.preload = 'metadata';
      video.src = url;
      video.currentTime = timeInSeconds; // Seek to the desired time

      // Wait for metadata to load to get dimensions
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };

      // When the video has seeked to the correct time
      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Convert canvas to Blob (e.g., JPEG with 80% quality)
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url); // Clean up the object URL
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          }, 'image/jpeg', 0.8); // Adjust type/quality as needed
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      // Error handling
      video.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error(`Video loading error: ${e}`));
      };

      // Handle cases where seeking might not fire if time is 0 or near duration
      // If the time is very early, 'loadeddata' might be enough
      video.onloadeddata = () => {
        if (timeInSeconds === 0) { // If seeking to the very start
          video.dispatchEvent(new Event('seeked')); // Manually trigger seeked event
        }
      };

    });
  }
  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a title",
        variant: "destructive" as any,
      })
      return
    }

    setIsUploading(true);
    setUploadProgress(0);

    let generatedThumbnail: Blob | null = null;
    let thumbnailS3Key: string | null = null;

    console.log("Generating thumbnail...");
    try {
      generatedThumbnail = await generateThumbnail(selectedFile, 1); // Get frame at 1 second
      console.log("✅ Thumbnail generated");
    } catch (thumbError) {
      console.error("Thumbnail generation failed:", thumbError);
      toast({ title: "Warning", description: "Could not generate thumbnail, proceeding without it." });
      // Don't stop the upload, just proceed without a thumbnail
    }

    // --- 2. Get Pre-Signed URL(s) ---
    // a) For Thumbnail (if generated)
    if (generatedThumbnail) {
      console.log("Getting thumbnail upload URL...");
      const thumbFormDataUrl = new FormData();
      // Create a filename for the thumbnail (e.g., using video name + .jpg)
      const thumbFileName = selectedFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
      thumbFormDataUrl.append("fileName", thumbFileName);
      thumbFormDataUrl.append("contentType", "image/jpeg");

      const thumbUrlResponse = await generatePresignedUploadUrl(thumbFormDataUrl); // Re-use or create specific action
      if (!thumbUrlResponse.success || !thumbUrlResponse.url || !thumbUrlResponse.key) {
        throw new Error(thumbUrlResponse.error || "Failed to get thumbnail upload URL.");
      }
      console.log("✅ Got thumbnail upload URL");

      // --- 3. Upload Thumbnail Directly to S3 ---
      console.log("Uploading thumbnail...");
      await fetch(thumbUrlResponse.url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: generatedThumbnail,
      });
      console.log("✅ Thumbnail uploaded");
      thumbnailS3Key = thumbUrlResponse.key; // Store the key for later
    }

    setIsUploading(true)
    setUploadProgress(0)

    if (!selectedFile) {
      alert("Please select a video file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // --- 1. Get Pre-Signed URL ---
      const formDataUrl = new FormData();
      formDataUrl.append("fileName", selectedFile.name);
      formDataUrl.append("contentType", selectedFile.type);
      // userId is taken from session in the server action

     
      const urlResponse = await generatePresignedUploadUrl(formDataUrl);

      if (!urlResponse.success || !urlResponse.url || !urlResponse.key) {
        throw new Error(urlResponse.error || "Failed to get upload URL.");
      }

      const { url: signedUrl, key: s3Key } = urlResponse;

      // --- 2. Upload Directly to S3 ---
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl, true);
      xhr.setRequestHeader("Content-Type", selectedFile.type); // Crucial for S3

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText} - ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(selectedFile);
      });

      console.log("✅ Direct S3 Upload successful");

      // --- 3. Confirm Upload and Save Metadata ---
      const formDataMeta = new FormData();
      formDataMeta.append("s3Key", s3Key);
      formDataMeta.append("title", selectedFile.name); // Or get title from an input field
      // userId is taken from session in the server action

      if (thumbnailS3Key) {
        formDataMeta.append("thumbnailS3Key", thumbnailS3Key);
      }

      const metaResponse = await saveVideoMetadata(formDataMeta);

      if (!metaResponse.success) {
        throw new Error(metaResponse.error || "Failed to save video metadata.");
      }

      toast({
        title: "Upload Successful",
        description: `${videoTitle} has been uploaded and is being processed`,
      })

      // Call success callback with new video
      onUploadSuccess(metaResponse)

      // Reset form
      setSelectedFile(null)
      setVideoTitle("")
      setUploadProgress(0)
      onOpenChange(false)
    } catch (error) {
      console.error("Upload process failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  //   try {
  //     // Simulate upload progress
  //     const progressInterval = setInterval(() => {
  //       setUploadProgress((prev) => {
  //         if (prev >= 90) {
  //           clearInterval(progressInterval)
  //           return prev
  //         }
  //         return prev + Math.random() * 30
  //       })
  //     }, 500)

  //     // Call upload API
  //     const formData = new FormData()
  //     formData.append("file", selectedFile)
  //     formData.append("title", videoTitle)
  //     // formData.append("userId", userId)

  //     const response = await fetch("/api/upload-video", {
  //       method: "POST",
  //       body: formData,
  //     })

  //     clearInterval(progressInterval)
  //     setUploadProgress(100)

  //     if (!response.ok) {
  //       throw new Error("Upload failed")
  //     }

  //     const data = await response.json()

  //     toast({
  //       title: "Upload Successful",
  //       description: `${videoTitle} has been uploaded and is being processed`,
  //     })

  //     // Call success callback with new video
  //     onUploadSuccess(data.video)

  //     // Reset form
  //     setSelectedFile(null)
  //     setVideoTitle("")
  //     setUploadProgress(0)
  //     onOpenChange(false)
  //   } catch (error) {
  //     toast({
  //       title: "Upload Failed",
  //       description: "There was an error uploading your video. Please try again.",
  //       variant: "destructive" as any,
  //     })
  //   } finally {
  //     setIsUploading(false)
  //   }
  // }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>Upload a new video to your library. Maximum file size: 5GB</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
              ? "border-primary bg-primary/5 scale-105"
              : selectedFile
                ? "border-green-500/50 bg-green-500/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/2.5"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2 animate-scale-in">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground">Drag and drop your video here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Video Title</label>
            <Input
              placeholder="Enter video title..."
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              disabled={isUploading}
              className="bg-background"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium text-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null)
                setVideoTitle("")
                setUploadProgress(0)
                onOpenChange(false)
              }}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !videoTitle.trim() || isUploading}
              className="flex-1 hover-lift"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
