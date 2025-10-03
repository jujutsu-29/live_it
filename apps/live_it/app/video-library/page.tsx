"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Library, Search, Download, Trash2, Eye, Clock, HardDrive, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { db } from "@liveit/db"

interface UploadedVideo {
  id: string
  title: string
  filename: string
  s3Url: string
  thumbnailUrl: string
  uploadDate: string
  duration: number
  fileSize: number
  resolution: string
  status: "processing" | "ready" | "failed"
  views: number
}

export default function VideoLibraryPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [videos, setVideos] = useState<UploadedVideo[]>([])

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
      case "ready":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

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
      description: `Downloading ${video.filename}`,
    })
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || video.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalSize = videos.reduce((acc, video) => acc + video.fileSize, 0)
  const totalViews = videos.reduce((acc, video) => acc + video.views, 0)

  const { data: session } = useSession();

  if (!session || !session.user) {
    return redirect('/signin');
  }

  const user = session.user;

  useEffect(() => {
    const fetchVideos = async () => {
      const result = await db.Video.findMany({
        where: { userId: user.id },
        orderBy: { addedDate: 'desc' }
      });
      setVideos(result);
    }
    fetchVideos();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navigation />

        <main className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Video Library</h1>
            <p className="text-muted-foreground">Manage all your uploaded videos stored on S3</p>
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
                  {videos.filter((v) => v.status === "ready").length} ready to stream
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
                <p className="text-xs text-muted-foreground">Across all videos</p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
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
              <CardDescription>All your uploaded videos with metadata</CardDescription>
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
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                        <Badge variant="outline" className={`absolute top-2 right-2 ${getStatusColor(video.status)}`}>
                          {video.status}
                        </Badge>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-medium text-foreground mb-1 line-clamp-2">{video.title}</h3>
                          <p className="text-xs text-muted-foreground">{video.filename}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(video.uploadDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.views}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{video.resolution}</span>
                          <span>{formatFileSize(video.fileSize)}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(video)}
                            disabled={video.status !== "ready"}
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
        </main>
      </div>
    </AuthGuard>
  )
}
