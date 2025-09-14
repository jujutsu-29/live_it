"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Play,
  Square,
  Settings,
  Users,
  MessageCircle,
  Youtube,
  Volume2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StreamSettings {
  camera: boolean
  microphone: boolean
  screenShare: boolean
  cameraDevice: string
  microphoneDevice: string
  resolution: string
  bitrate: number
  volume: number
}

interface StreamStatus {
  isLive: boolean
  isConnected: boolean
  youtubeConnected: boolean
  streamKey: string
  viewerCount: number
  duration: number
  bitrate: number
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
}

export default function StudioPage() {
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    camera: false,
    microphone: false,
    screenShare: false,
    cameraDevice: "",
    microphoneDevice: "",
    resolution: "1080p",
    bitrate: 2500,
    volume: 80,
  })

  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    isConnected: false,
    youtubeConnected: false,
    streamKey: "",
    viewerCount: 0,
    duration: 0,
    bitrate: 0,
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      username: "StreamFan123",
      message: "Great stream! Looking forward to this.",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      username: "TechGuru",
      message: "Audio sounds perfect!",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "3",
      username: "ViewerX",
      message: "Can you show the code again?",
      timestamp: new Date(Date.now() - 60000),
    },
  ])

  const [countdown, setCountdown] = useState<number | null>(null)
  const [devices, setDevices] = useState<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[] }>({
    cameras: [],
    microphones: [],
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  // Mock device enumeration
  useEffect(() => {
    const mockDevices = {
      cameras: [
        { deviceId: "camera1", label: "Built-in Camera", kind: "videoinput" } as MediaDeviceInfo,
        { deviceId: "camera2", label: "External Webcam", kind: "videoinput" } as MediaDeviceInfo,
      ],
      microphones: [
        { deviceId: "mic1", label: "Built-in Microphone", kind: "audioinput" } as MediaDeviceInfo,
        { deviceId: "mic2", label: "USB Microphone", kind: "audioinput" } as MediaDeviceInfo,
      ],
    }
    setDevices(mockDevices)
    setStreamSettings((prev) => ({
      ...prev,
      cameraDevice: mockDevices.cameras[0]?.deviceId || "",
      microphoneDevice: mockDevices.microphones[0]?.deviceId || "",
    }))
  }, [])

  // Mock YouTube connection check
  useEffect(() => {
    const checkYouTubeConnection = async () => {
      // Mock API call to check YouTube OAuth status
      try {
        const response = await fetch("/api/oauth/youtube")
        const data = await response.json()
        setStreamStatus((prev) => ({
          ...prev,
          youtubeConnected: data.connected,
          streamKey: data.streamKey || "",
        }))
      } catch (error) {
        console.error("Failed to check YouTube connection:", error)
      }
    }

    checkYouTubeConnection()
  }, [])

  // Stream duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (streamStatus.isLive) {
      interval = setInterval(() => {
        setStreamStatus((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [streamStatus.isLive])

  // Mock viewer count updates
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (streamStatus.isLive) {
      interval = setInterval(() => {
        setStreamStatus((prev) => ({
          ...prev,
          viewerCount: Math.max(0, prev.viewerCount + Math.floor(Math.random() * 10) - 4),
          bitrate: 2400 + Math.floor(Math.random() * 200),
        }))
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [streamStatus.isLive])

  const handleCameraToggle = async () => {
    try {
      if (!streamSettings.camera) {
        // Mock camera access
        const mockStream = new MediaStream()
        streamRef.current = mockStream
        if (videoRef.current) {
          videoRef.current.srcObject = mockStream
        }
        setStreamStatus((prev) => ({ ...prev, isConnected: true }))
        toast({
          title: "Camera enabled",
          description: "Your camera is now active.",
        })
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        toast({
          title: "Camera disabled",
          description: "Your camera has been turned off.",
        })
      }
      setStreamSettings((prev) => ({ ...prev, camera: !prev.camera }))
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const handleMicrophoneToggle = () => {
    setStreamSettings((prev) => ({ ...prev, microphone: !prev.microphone }))
    toast({
      title: streamSettings.microphone ? "Microphone muted" : "Microphone enabled",
      description: streamSettings.microphone ? "Your microphone is now muted." : "Your microphone is now active.",
    })
  }

  const handleScreenShareToggle = () => {
    setStreamSettings((prev) => ({ ...prev, screenShare: !prev.screenShare }))
    toast({
      title: streamSettings.screenShare ? "Screen sharing stopped" : "Screen sharing started",
      description: streamSettings.screenShare
        ? "You are no longer sharing your screen."
        : "You are now sharing your screen.",
    })
  }

  const handleStartStream = async () => {
    if (!streamStatus.youtubeConnected) {
      toast({
        title: "YouTube not connected",
        description: "Please connect your YouTube account first.",
        variant: "destructive",
      })
      return
    }

    // Countdown before starting
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval)
          startStreamingProcess()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  const startStreamingProcess = async () => {
    try {
      // Mock API call to start stream
      const response = await fetch("/api/start-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId: "stream_" + Date.now(),
          settings: streamSettings,
        }),
      })

      if (response.ok) {
        setStreamStatus((prev) => ({
          ...prev,
          isLive: true,
          viewerCount: 1,
          duration: 0,
        }))
        toast({
          title: "Stream started!",
          description: "You are now live on YouTube.",
        })
      } else {
        throw new Error("Failed to start stream")
      }
    } catch (error) {
      toast({
        title: "Stream failed",
        description: "Failed to start the stream. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStopStream = async () => {
    try {
      // Mock API call to stop stream
      const response = await fetch("/api/stop-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setStreamStatus((prev) => ({
          ...prev,
          isLive: false,
          viewerCount: 0,
          duration: 0,
          bitrate: 0,
        }))
        toast({
          title: "Stream ended",
          description: "Your stream has been stopped.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop the stream.",
        variant: "destructive",
      })
    }
  }

  const connectYouTube = async () => {
    try {
      // Mock OAuth flow
      window.open("/api/oauth/youtube", "_blank", "width=500,height=600")
      // Simulate successful connection after a delay
      setTimeout(() => {
        setStreamStatus((prev) => ({
          ...prev,
          youtubeConnected: true,
          streamKey: "mock-stream-key-" + Date.now(),
        }))
        toast({
          title: "YouTube connected!",
          description: "Your YouTube account has been connected successfully.",
        })
      }, 3000)
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Studio</h1>
                <p className="text-muted-foreground">Manage your live stream and interact with your audience.</p>
              </div>
              <div className="flex items-center space-x-4">
                {streamStatus.isLive && (
                  <Badge variant="destructive" className="animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    LIVE
                  </Badge>
                )}
                {streamStatus.youtubeConnected ? (
                  <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    YouTube Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    YouTube Disconnected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Video Preview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Preview</CardTitle>
                  <CardDescription>Your live stream preview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {countdown && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                        <div className="text-6xl font-bold text-white animate-pulse">{countdown}</div>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                      style={{ display: streamSettings.camera ? "block" : "none" }}
                    />
                    {!streamSettings.camera && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Camera is off</p>
                        </div>
                      </div>
                    )}
                    {streamSettings.screenShare && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">
                          <Monitor className="w-3 h-3 mr-1" />
                          Screen Sharing
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Stream Controls */}
                  <div className="flex items-center justify-center space-x-4 mt-6">
                    <Button
                      variant={streamSettings.camera ? "default" : "outline"}
                      size="lg"
                      onClick={handleCameraToggle}
                      aria-label={streamSettings.camera ? "Turn off camera" : "Turn on camera"}
                    >
                      {streamSettings.camera ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant={streamSettings.microphone ? "default" : "outline"}
                      size="lg"
                      onClick={handleMicrophoneToggle}
                      aria-label={streamSettings.microphone ? "Mute microphone" : "Unmute microphone"}
                    >
                      {streamSettings.microphone ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant={streamSettings.screenShare ? "default" : "outline"}
                      size="lg"
                      onClick={handleScreenShareToggle}
                      aria-label={streamSettings.screenShare ? "Stop screen sharing" : "Start screen sharing"}
                    >
                      {streamSettings.screenShare ? (
                        <Monitor className="h-5 w-5" />
                      ) : (
                        <MonitorOff className="h-5 w-5" />
                      )}
                    </Button>

                    <Separator orientation="vertical" className="h-8" />

                    {!streamStatus.isLive ? (
                      <Button
                        size="lg"
                        onClick={handleStartStream}
                        disabled={!streamStatus.youtubeConnected}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Stream
                      </Button>
                    ) : (
                      <Button size="lg" onClick={handleStopStream} variant="destructive">
                        <Square className="h-5 w-5 mr-2" />
                        Stop Stream
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stream Stats */}
              {streamStatus.isLive && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stream Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{streamStatus.viewerCount}</div>
                        <div className="text-sm text-muted-foreground">Viewers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {formatDuration(streamStatus.duration)}
                        </div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{streamStatus.bitrate}</div>
                        <div className="text-sm text-muted-foreground">kbps</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Settings & Chat */}
            <div className="lg:col-span-2 space-y-6">
              {/* YouTube Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <span>YouTube Integration</span>
                  </CardTitle>
                  <CardDescription>Connect your YouTube account to start streaming</CardDescription>
                </CardHeader>
                <CardContent>
                  {!streamStatus.youtubeConnected ? (
                    <Button onClick={connectYouTube} className="w-full">
                      <Youtube className="h-4 w-4 mr-2" />
                      Connect YouTube Account
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">YouTube account connected</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stream Key: {streamStatus.streamKey.substring(0, 20)}...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stream Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Stream Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="camera-select">Camera</Label>
                    <Select
                      value={streamSettings.cameraDevice}
                      onValueChange={(value) => setStreamSettings((prev) => ({ ...prev, cameraDevice: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.cameras.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="microphone-select">Microphone</Label>
                    <Select
                      value={streamSettings.microphoneDevice}
                      onValueChange={(value) => setStreamSettings((prev) => ({ ...prev, microphoneDevice: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.microphones.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution-select">Resolution</Label>
                    <Select
                      value={streamSettings.resolution}
                      onValueChange={(value) => setStreamSettings((prev) => ({ ...prev, resolution: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p (1280x720)</SelectItem>
                        <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                        <SelectItem value="1440p">1440p (2560x1440)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bitrate-slider">Bitrate: {streamSettings.bitrate} kbps</Label>
                    <Slider
                      id="bitrate-slider"
                      min={1000}
                      max={6000}
                      step={100}
                      value={[streamSettings.bitrate]}
                      onValueChange={(value) => setStreamSettings((prev) => ({ ...prev, bitrate: value[0] }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volume-slider">Volume: {streamSettings.volume}%</Label>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4" />
                      <Slider
                        id="volume-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[streamSettings.volume]}
                        onValueChange={(value) => setStreamSettings((prev) => ({ ...prev, volume: value[0] }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Live Chat</span>
                    {streamStatus.isLive && (
                      <Badge variant="secondary" className="ml-auto">
                        <Users className="h-3 w-3 mr-1" />
                        {streamStatus.viewerCount}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 w-full border border-border rounded-md p-4">
                    {streamStatus.isLive ? (
                      <div className="space-y-3">
                        {chatMessages.map((message) => (
                          <div key={message.id} className="text-sm">
                            <span className="font-medium text-primary">{message.username}:</span>{" "}
                            <span className="text-foreground">{message.message}</span>
                            <div className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Chat will appear when you go live</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
