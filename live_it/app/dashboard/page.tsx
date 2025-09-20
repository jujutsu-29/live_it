"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, TrendingUp, Video, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface BookingSlot {
  id: string
  title: string
  date: string
  time: string
  duration: number
  status: "upcoming" | "completed" | "cancelled" | "live"
  viewers?: number
  revenue?: number
  youtubeUrl?: string
}

interface DashboardStats {
  totalBookings: number
  upcomingStreams: number
  totalViewers: number
  totalRevenue: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingStreams: 0,
    totalViewers: 0,
    totalRevenue: 0,
  })
  const [bookings, setBookings] = useState<BookingSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data loading
    const loadDashboardData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        totalBookings: 24,
        upcomingStreams: 3,
        totalViewers: 12500,
        totalRevenue: 2400,
      })

      setBookings([
        {
          id: "1",
          title: "Weekly Tech Talk",
          date: "2024-12-15",
          time: "14:00",
          duration: 60,
          status: "upcoming",
        },
        {
          id: "2",
          title: "Product Launch Stream",
          date: "2024-12-12",
          time: "16:00",
          duration: 90,
          status: "completed",
          viewers: 850,
          revenue: 150,
          youtubeUrl: "https://youtube.com/watch?v=example1",
        },
        {
          id: "3",
          title: "Q&A Session",
          date: "2024-12-10",
          time: "18:00",
          duration: 45,
          status: "completed",
          viewers: 420,
          revenue: 75,
          youtubeUrl: "https://youtube.com/watch?v=example2",
        },
        {
          id: "4",
          title: "Tutorial Series Ep 5",
          date: "2024-12-08",
          time: "15:30",
          duration: 120,
          status: "cancelled",
        },
        {
          id: "5",
          title: "Live Coding Session",
          date: "2024-12-18",
          time: "20:00",
          duration: 180,
          status: "upcoming",
        },
      ])

      setIsLoading(false)
    }

    loadDashboardData()
  }, [])

  const getStatusIcon = (status: BookingSlot["status"]) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "live":
        return <Play className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: BookingSlot["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "live":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navigation />

        <main className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your streaming activity.</p>
          </div>

          <Card className="mb-8 hover-lift animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                About StreamLive
              </CardTitle>
              <CardDescription>Learn more about our platform and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                <video className="w-full h-full object-cover rounded-lg" controls poster="/streamlive-brand-video-thumbnail.jpg">
                  <source src="/placeholder-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Discover how StreamLive revolutionizes live streaming with professional booking, seamless YouTube
                integration, and powerful analytics.
              </p>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Streams</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingStreams}</div>
                <p className="text-xs text-muted-foreground">Next stream in 2 days</p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViewers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+23% from last month</p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-stagger">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue}</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 hover-lift animate-slide-up">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your next stream</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/schedule">
                  <Button className="w-full sm:w-auto hover-lift">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book New Slot
                  </Button>
                </Link>
                <Link href="/studio">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent hover-lift">
                    <Video className="h-4 w-4 mr-2" />
                    Go to Studio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Bookings History */}
          <Card className="hover-lift animate-slide-up">
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>Your recent and upcoming streaming sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{booking.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time} • {booking.duration} min
                          </p>
                          {booking.viewers && (
                            <p className="text-sm text-muted-foreground">
                              {booking.viewers} viewers • ${booking.revenue} revenue
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {booking.youtubeUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={booking.youtubeUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        )}
                        {booking.status === "upcoming" && (
                          <Link href="/studio">
                            <Button size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Start Stream
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  {bookings
                    .filter((booking) => booking.status === "upcoming")
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{booking.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time} • {booking.duration} min
                            </p>
                          </div>
                        </div>
                        <Link href="/studio">
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Start Stream
                          </Button>
                        </Link>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {bookings
                    .filter((booking) => booking.status === "completed")
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{booking.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time} • {booking.duration} min
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.viewers} viewers • ${booking.revenue} revenue
                            </p>
                          </div>
                        </div>
                        {booking.youtubeUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={booking.youtubeUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="cancelled" className="space-y-4">
                  {bookings
                    .filter((booking) => booking.status === "cancelled")
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{booking.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time} • {booking.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
