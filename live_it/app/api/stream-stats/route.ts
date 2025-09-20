import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const streamId = searchParams.get("streamId")
  const timeRange = searchParams.get("timeRange") || "24h"

  if (!streamId) {
    return NextResponse.json({ error: "Missing stream ID" }, { status: 400 })
  }

  // Mock real-time stream statistics
  const mockStats = {
    success: true,
    streamId,
    timestamp: new Date().toISOString(),
    live: {
      viewerCount: Math.floor(Math.random() * 500) + 50,
      bitrate: 2400 + Math.floor(Math.random() * 200),
      fps: 30,
      resolution: "1080p",
      health: Math.random() > 0.1 ? "good" : "warning",
      uptime: Math.floor(Math.random() * 7200) + 300, // 5 minutes to 2 hours
      chatRate: Math.floor(Math.random() * 10) + 1, // messages per minute
    },
    session: {
      peakViewers: Math.floor(Math.random() * 200) + 100,
      averageViewers: Math.floor(Math.random() * 150) + 75,
      totalViewTime: Math.floor(Math.random() * 50000) + 10000,
      newFollowers: Math.floor(Math.random() * 25) + 5,
      chatMessages: Math.floor(Math.random() * 500) + 100,
      likes: Math.floor(Math.random() * 100) + 25,
      shares: Math.floor(Math.random() * 20) + 3,
    },
    technical: {
      droppedFrames: Math.floor(Math.random() * 10),
      networkJitter: Math.random() * 5,
      latency: Math.floor(Math.random() * 3000) + 1000, // 1-4 seconds
      bandwidth: Math.floor(Math.random() * 1000) + 2000, // kbps
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
    },
    geographic: {
      topCountries: [
        { country: "United States", viewers: Math.floor(Math.random() * 100) + 50 },
        { country: "United Kingdom", viewers: Math.floor(Math.random() * 50) + 25 },
        { country: "Canada", viewers: Math.floor(Math.random() * 30) + 15 },
        { country: "Germany", viewers: Math.floor(Math.random() * 25) + 10 },
        { country: "Australia", viewers: Math.floor(Math.random() * 20) + 8 },
      ],
    },
    engagement: {
      retentionRate: Math.floor(Math.random() * 30) + 60, // 60-90%
      averageWatchTime: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
      clickThroughRate: Math.floor(Math.random() * 15) + 5, // 5-20%
      interactionRate: Math.floor(Math.random() * 25) + 10, // 10-35%
    },
  }

  return NextResponse.json(mockStats)
}

export async function POST(request: NextRequest) {
  try {
    const { streamId, event, data } = await request.json()

    if (!streamId || !event) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock event tracking (viewer joined, chat message, etc.)
    const eventResponse = {
      success: true,
      streamId,
      event,
      timestamp: new Date().toISOString(),
      processed: true,
      message: `Event '${event}' recorded successfully`,
    }

    return NextResponse.json(eventResponse)
  } catch (error) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 })
  }
}
