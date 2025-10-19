"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Library, Search, Download, Trash2, Eye, Clock, HardDrive, Filter, Square, Play, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
// import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"
import { fetchVideos } from "@/lib/actions/videos"
import axios from "axios"
import { getUserStreamKey } from "@/lib/actions/user"
import { VideoUploadDialog } from "@/components/video-upload-dialog"
import { decrypt } from "@/lib/actions/crypto"

interface UploadedVideo {
  title: string;
  id: string;
  url: string | null;
  description: string | null;
  addedDate: Date;
  thumbnail: string | null;
  status: "active" | "deleted" | "streaming" | "stopped" | "failed"
  duration: number | null;
}

interface VideoLibraryClientProps {
  s3BucketName: string;
  s3Region: string;
}

export default function VideoLibraryPage(s3Values: VideoLibraryClientProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [streamKey, setStreamKey] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isKeyLoading, setIsKeyLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState<
    Record<
      string,
      {
        youtubeUrl: string
        streamId: string
        startedAt: string
      }
    >
  >({})

  const router = useRouter()
  const [loadingStreamId, setLoadingStreamId] = useState<string | null>(null)


  const [videos, setVideos] = useState<UploadedVideo[]>([])

  const isAnyStreamLive = Object.keys(liveStreams).length > 0;

  const handleUploadSuccess = (newVideo: UploadedVideo) => {
    setVideos((prev) => [newVideo, ...prev])
    toast({
      title: "Video Added",
      description: `${newVideo.title} has been added to your library and is being processed`,
    })
  }

  // console.log("S3 Bucket Name:", s3Values);
  // console.log("S3 Region:", s3Region);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`
    }
    return `${mb.toFixed(2)} MB`
  }



  const getStatusColor = (status: UploadedVideo["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "streaming":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "deleted":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "stopped":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const { data: session, status } = useSession()
  const user = session?.user;



  const userId = session?.user?.id;

  useEffect(() => {
    if (!user?.id) return;
    setIsKeyLoading(true);
    const loadKey = async () => {
      try {
        const res = await getUserStreamKey(user.id as string);
        setStreamKey(res?.streamKey ?? null);
      } catch (e) {
        setStreamKey(null);
      }
    };
    if (session?.user?.id) {
      loadKey();
    }
    setIsKeyLoading(false);
  }, [session]);

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter((video) => video.id !== id))
    toast({
      title: "Video Deleted",
      description: "The video has been removed from your library",
    })
  }

  const handleDownload = (video: UploadedVideo) => {
    toast({
      title: "Download Started",
      description: `Downloading ${video.title}`,
    })
  }

  const handleStartStream = async (video: UploadedVideo) => {
    try {
      console.log("Stream start trying");
      setLoadingStreamId(video.id)

      console.log("Current stream key:", streamKey);
      // if(!streamKey) {
      //   toast({ title: "Stream Key Missing", description: "Please set up your stream key in your profile settings.", variant: "destructive" as any })
      //   return router.push("/profile");
      // }
      if (!streamKey) {
        throw Error("No stream key found")
      }
      const decryptedStreamKey = await decrypt(streamKey);
      console.log("decrypted stream key is this sarr ", decryptedStreamKey);
      const { data } = await axios.post(
        `/api/worker/start-stream`,
        { id: video.id, streamKey: decryptedStreamKey }
      )
      // const { data } = await axios.post(
      //   `http://localhost:4000/start-stream`,
      //   { id: video.id, streamKey: decryptedStreamKey }
      // )

      console.log("Start stream response data:", data);
      // const res = await fetch("/api/start-stream", {
      //   method: "POST",
      if (!data || data.error) throw new Error("Failed to start stream")
      setLiveStreams((prev) => ({
        ...prev,
        [video.id]: {
          youtubeUrl: data.youtubeUrl,
          streamId: data.streamId,
          startedAt: data.startedAt,
        },
      }))

      setVideos(prevVideos =>
        prevVideos.map(v =>
          v.id === video.id ? { ...v, status: "streaming" } : v
        )
      );

      toast({
        title: "Stream started",
        description: "You're live now.",
      })
    } catch (e) {
      console.log("error in representing stream ", e);
      toast({ title: "Unable to start stream", description: "Please try again.", variant: "destructive" as any })
    } finally {
      setLoadingStreamId(null)
    }
  }

  const handleStopStream = async (video: UploadedVideo) => {
    try {
      console.log("Stream stop trying");
      setLoadingStreamId(video.id)
      const { data } = await axios.post(
        `/api/worker/stop-stream`,
        { id: video.id }
      )

      console.log("Stop stream response data:", data);
      if (data.error) throw new Error("Failed to stop stream")
      // remove from live map
      setLiveStreams((prev) => {
        const next = { ...prev }
        delete next[video.id]
        return next
      })

      setVideos(prevVideos =>
        prevVideos.map(v =>
          v.id === video.id ? { ...v, status: "stopped" } : v
        )
      );

      toast({
        title: "Stream ended",
        description: "We’ve generated a summary for your stream.",
      })
    } catch (e) {
      console.log("Error in stopping stream ", e);
      toast({ title: "Unable to stop stream", description: "Please try again.", variant: "destructive" as any })
    } finally {
      setLoadingStreamId(null)
    }
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title?.toLowerCase().includes(searchQuery.toLowerCase())
    // ||      video.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || video.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // const imageValue = `{https://${s3Values.s3BucketName}.s3.${s3Values.s3Region}.amazonaws.com/uploads/${userId}/${filteredVideos.thumbnail}}`
  // const imageValue = `{https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${userId}/${filteredVideos.thumbnail}}`
  // console.log("image value is this ", imageValue);
  // const totalSize = videos.reduce((acc, video) => acc + video.fileSize, 0)
  // const totalViews = videos.reduce((acc, video) => acc + video.views, 0)


  useEffect(() => {
    const load = async () => {
      const result = await fetchVideos(userId || "");
      setVideos(result);
    };
    if (userId) load();
  }, [userId]);

  // 3. ADD THIS LOADING CHECK
  if (status === "loading") {
    // You can replace this with a proper loading spinner
    return <div>Loading session...</div>;
  }

  // 4. NOW, your original check will work correctly
  if (status === "unauthenticated" || !session || !user || !user.id) {
    return router.push("/signin");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navigation />

        <main className="container mx-auto px-4 py-8 animate-fade-in">
          {/* <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Video Library</h1>
            <p className="text-muted-foreground">Manage all your uploaded videos</p>
          </div> */}

          <div className="mb-8 animate-slide-up flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Video Library</h1>
              <p className="text-muted-foreground">Manage all your uploaded videos</p>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)} className="hover-lift animate-scale-in">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Library className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videos.length}</div>
                <p className="text-xs text-muted-foreground">
                  {videos.filter((v) => v.status === "active").length} ready to stream
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div> */}
                <p className="text-xs text-muted-foreground">Across all videos</p>
              </CardContent>
            </Card>

            {/* <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card> */}
          </div>

          {/* Search and Filter */}
          <Card className="mb-8 hover-lift animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos by title or filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Video Grid */}
          <Card className="hover-lift animate-slide-up">
            <CardHeader>
              <CardTitle>Your Videos ({filteredVideos.length})</CardTitle>
              <CardDescription>All your uploaded videos</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No videos found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Upload your first video to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-all duration-200 animate-stagger"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative aspect-video bg-muted">
                        <img
                          // src={`{https://${s3BucketName.s3BucketName}.s3.${s3BucketName.s3Region}.amazonaws.com/uploads/${userId}/${video.thumbnail}` || "/placeholder.svg"}
                          src={
                            video.thumbnail && s3Values.s3BucketName && s3Values.s3Region
                              ? `https://${s3Values.s3BucketName}.s3.${s3Values.s3Region}.amazonaws.com/${video.thumbnail}` // Just use video.thumbnail
                              : "/placeholder.svg" // Fallback if thumbnail is missing
                          }
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration || 0)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`absolute top-2 right-2 ${liveStreams[video.id]
                            ? "bg-red-500/15 text-red-500 border-red-500/20"
                            : getStatusColor(video.status)
                            }`}
                        >
                          {liveStreams[video.id] ? "LIVE" : video.status}
                        </Badge>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-medium text-foreground mb-1 line-clamp-2">{video.title}</h3>
                          <p className="text-xs text-muted-foreground">{video.title}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(video.addedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {/* <span>{video.resolution}</span> */}
                          {/* <span>{formatFileSize(video.fileSize)}</span> */}
                        </div>

                        {liveStreams[video.id]?.youtubeUrl ? (
                          <p className="text-xs">
                            <a
                              href={liveStreams[video.id].youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              View on YouTube
                            </a>
                          </p>
                        ) : null}

                        <div className="flex items-center gap-2 pt-2">

                          {liveStreams[video.id] ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStopStream(video)}
                              disabled={loadingStreamId === video.id}
                              className="flex-1 hover-lift"
                            >
                              <Square className="h-4 w-4 mr-1" />
                              {loadingStreamId === video.id ? "Stopping..." : "Stop Stream"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleStartStream(video)}
                              // disabled={video.status !== "streaming" || loadingStreamId === video.id}
                              disabled={
                                isKeyLoading ||
                                isAnyStreamLive ||         // Disable if any stream is live
                                loadingStreamId !== null  // Disable if any request is loading
                                // || video.status !== "active" // Disable if video is not "active" (ready)
                              }
                              className="flex-1 hover-lift"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              {loadingStreamId === video.id ? "Starting..." : "Stream Now"}
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(video)}
                            // disabled={video.status !== "active"}
                            className="flex-1 bg-transparent hover-lift"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="bg-transparent hover:bg-destructive/10 hover:text-destructive hover-lift"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <VideoUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            onUploadSuccess={handleUploadSuccess}
            userId={userId || ""}
          />
        </main>
      </div>
    </AuthGuard>
  )
}
