import { type NextRequest, NextResponse } from "next/server"

interface StopStreamRequest {
  streamId?: string
  reason?: string
}

export async function POST(request: NextRequest) {
  try {
    const { streamId, reason }: StopStreamRequest = await request.json()

    // Mock stream termination
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 30 * 60 * 1000) // Mock 30 min stream

    const streamSummary = {
      success: true,
      streamId: streamId || `stream_${Date.now()}`,
      status: "ended",
      startedAt: startTime.toISOString(),
      endedAt: endTime.toISOString(),
      duration: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
      reason: reason || "manual_stop",
      finalStats: {
        totalViewers: Math.floor(Math.random() * 1000) + 100,
        peakViewers: Math.floor(Math.random() * 200) + 50,
        averageViewTime: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
        totalViewTime: Math.floor(Math.random() * 50000) + 10000, // in seconds
        chatMessages: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 100) + 20,
        shares: Math.floor(Math.random() * 20) + 5,
      },
      recording: {
        available: true,
        url: `https://youtube.com/watch?v=${Math.random().toString(36).substring(2, 13)}`,
        duration: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
        size: "1.2 GB",
        quality: "1080p",
      },
      analytics: {
        engagement: "high",
        retentionRate: "78%",
        clickThroughRate: "12%",
        subscribersGained: Math.floor(Math.random() * 50) + 5,
      },
      message: "Stream ended successfully",
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(streamSummary, { status: 200 })
  } catch (error) {
    console.error("Stop stream error:", error)
    return NextResponse.json(
      {
        error: "Failed to stop stream",
        message: "Unable to properly terminate the stream. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  // Mock get recent streams
  const mockRecentStreams = [
    {
      id: "stream_1",
      title: "Weekly Tech Talk",
      startedAt: "2024-12-12T14:00:00Z",
      endedAt: "2024-12-12T15:30:00Z",
      duration: 5400, // 90 minutes
      status: "completed",
      stats: {
        totalViewers: 245,
        peakViewers: 89,
        averageViewTime: 420,
        totalViewTime: 102900,
      },
    },
    {
      id: "stream_2",
      title: "Product Demo",
      startedAt: "2024-12-10T16:00:00Z",
      endedAt: "2024-12-10T17:00:00Z",
      duration: 3600, // 60 minutes
      status: "completed",
      stats: {
        totalViewers: 156,
        peakViewers: 67,
        averageViewTime: 380,
        totalViewTime: 59280,
      },
    },
  ]

  return NextResponse.json({
    success: true,
    streams: mockRecentStreams,
    total: mockRecentStreams.length,
  })
}
