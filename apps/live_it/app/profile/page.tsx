"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Calendar, Youtube, Twitter, Instagram, Edit3, Save, X } from "lucide-react"
import { getUserStreamKey, updateProfile } from "@/lib/actions/user"
import crypto from "crypto"
import { decrypt } from "@/lib/actions/crypto"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    joinDate: "",
    avatar: "/placeholder.svg",
    streamKey: "",
    youtubeUserName: "",
    stats: {
      totalStreams: 0,
      totalViewers: 0,
      followers: 0,
      hoursStreamed: 0,
    },
  })

  // Prefill profile from NextAuth session
  useEffect(() => {
    if(!session){
      return;
    }
      //  if(!session.user) return;

    if (session?.user) {
      setProfile((prev) => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
        avatar: session.user?.image || "/placeholder.svg",
      }))
    }

    async function loadStreamKey() {
      try {
        const res = await getUserStreamKey(session?.user?.id || "");
        // const key = res?.streamKey ?? "";
        let key;

        if(res?.streamKey) {
          key = await decrypt(res.streamKey);
        } else {
          key = "";
        }
        setProfile((prev) => ({
          ...prev,
          streamKey: key,
        }))
      } catch (err) {
        console.error("Failed to load stream key", err)
      }
    }

    loadStreamKey()
  }, [session])

  

  const handleSave = async () => {
    setIsEditing(false)
    await updateProfile(profile, session?.user?.id || "");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navigation />

        <main className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your public profile and streaming presence.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="hover-lift animate-scale-in">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                        disabled
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      {/* <p className="text-muted-foreground">@{profile.username}</p> */}
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Pro Streamer
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div> */}
                      {/* <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {profile.joinDate || "—"}
                      </div> */}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        size="sm"
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        className="hover-lift"
                      >
                        {isEditing ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                      {isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="hover-lift">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="hover-lift animate-scale-in">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    {isEditing ? "Edit your profile information" : "Your public profile information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={profile.name} disabled />
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div> */}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell your audience about yourself..."
                    />
                  </div> */}
                  
                  

                  <div className="space-y-2">
                    <Label htmlFor="streamKey">Stream Key</Label>
                    <Textarea
                      id="streamKey"
                      value={profile.streamKey}
                      onChange={(e) => setProfile({ ...profile, streamKey: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell your youTube stream key..."
                    />
                  </div>
                  </div>

                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="hover-lift animate-scale-in">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Connect your social media accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      YouTube
                    </Label>
                    <Input
                      id="youtube"
                      value={profile.youtubeUserName}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          youtubeUserName: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="https://youtube.com/@username"
                    />
                  </div>

                  {/* <div className="space-y-2"> */}
                    {/* <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-500" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={profile.socialLinks.twitter}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={profile.socialLinks.instagram}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: { ...profile.socialLinks, instagram: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="https://instagram.com/username"
                    />
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
