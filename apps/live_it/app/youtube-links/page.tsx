"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Link2, Trash2, ExternalLink, Plus, CheckCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { db } from "@liveit/db";
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation";
import { fetchVideos, handleDelete } from "@/lib/actions/videos"

interface YouTubeLink {
  id: string
  url: string
  title: string
  addedDate: string
  status: "active" | "archived" | "failed"
}

export default function YouTubeLinksPage() {
  const { toast } = useToast()
  const [links, setLinks] = useState<YouTubeLink[]>([])

  const [newLink, setNewLink] = useState({
    url: "",
    title: "",
    description: "",
  })

  const { data: session } = useSession()
  const user = session?.user

  if (!session || !user || !user.id || user.id === undefined) {
    return redirect("/signin")
    // return null
  }

  useEffect(() => {
    async function fetchData() {
      if(user?.id){
        const result = await fetchVideos(user.id);
        const links: YouTubeLink[] = result.map(video => ({
      ...video,
      status: "active",
      url: video.url,
      title: video.title || "Untitled",
      addedDate: video.addedDate.toISOString().split("T")[0],
    }));
        setLinks(links);
      }
    }
    fetchData();
  }, [])


  const [isAdding, setIsAdding] = useState(false)

  

  const handleAddLink = async () => {
    // console.log("hi there coming in", newLink);
    if (!newLink.url) {
      toast({
        title: "Missing Information",
        description: "Please provide both URL and title",
        variant: "destructive",
      })
      return
    }


    // console.log("hi there coming in", newLink);
    // const result = await axios.post('/api/download', { videoUrl: newLink.url });
    const result = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/process-job`, { videoUrl: newLink.url, userId: user.id });
    // console.log("Result from adding link:", result);

    const link: YouTubeLink = {
      id: Date.now().toString(),
      url: newLink.url,
      title: newLink.title,
      addedDate: new Date().toISOString().split("T")[0],
      status: "active",
    }

    setLinks([link, ...links])
    setNewLink({ url: "", title: "", description: "" })
    setIsAdding(false)

    toast({
      title: "Link Added",
      description: "Your YouTube link has been saved successfully",
    })
  }

  // const handleDelete = (id: string) => {
  //   setLinks(links.filter((link) => link.id !== id))
  //   toast({
  //     title: "Link Removed",
  //     description: "The YouTube link has been deleted",
  //   })
  // }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navigation />

        <main className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">YouTube Links</h1>
            <p className="text-muted-foreground">Manage and organize your YouTube video links in one place</p>
          </div>

          {/* Add New Link Card */}
          <Card className="mb-8 hover-lift animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New YouTube Link
              </CardTitle>
              <CardDescription>Paste your YouTube video URL and add details</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAdding ? (
                <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto hover-lift">
                  <Plus className="h-4 w-4 mr-2" />
                  Add YouTube Link
                </Button>
              ) : (
                <div className="space-y-4 animate-slide-up">
                  <div className="space-y-2">
                    <Label htmlFor="url">YouTube URL *</Label>
                    <Input
                      id="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="bg-background"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleAddLink} className="hover-lift">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAdding(false)
                        setNewLink({ url: "", title: "", description: "" })
                      }}
                      className="bg-transparent hover-lift"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links List */}
          <Card className="hover-lift animate-slide-up">
            <CardHeader>
              <CardTitle>Your YouTube Links ({links.length})</CardTitle>
              <CardDescription>All your saved YouTube video links</CardDescription>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <div className="text-center py-12">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No links yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first YouTube video link</p>
                  <Button onClick={() => setIsAdding(true)} className="hover-lift">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <div
                      key={link.id}
                      className="p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-all duration-200 animate-stagger"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-primary" />
                            <h3 className="font-medium text-foreground">{link.title}</h3>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              {link.status}
                            </Badge>
                          </div>

                          {link.description && <p className="text-sm text-muted-foreground">{link.description}</p>}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Added: {new Date(link.addedDate).toLocaleDateString()}</span>
                            {/* <span>•</span> */}
                            {/* <span>{link.views.toLocaleString()} views</span> */}
                          </div>

                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground break-all">
                              {link.url}
                            </code>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(link.url)}
                            className="bg-transparent hover-lift"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" asChild className="bg-transparent hover-lift">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(link.id)}
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
