import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Mock YouTube OAuth endpoint
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (code) {
    // Mock successful OAuth callback
    return NextResponse.json({
      success: true,
      connected: true,
      streamKey: `sk_live_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      channelId: "UC" + Math.random().toString(36).substring(2, 15),
      channelName: "StreamLive User Channel",
      message: "YouTube account connected successfully",
    })
  }

  // Mock OAuth initiation
  const mockAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${process.env.YOUTUBE_CLIENT_ID}&redirect_uri=${encodeURIComponent(request.nextUrl.origin + "/api/oauth/youtube")}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube&access_type=offline`

  return NextResponse.json({
    connected: false,
    authUrl: mockAuthUrl,
    message: "Redirect to YouTube OAuth",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Mock OAuth token exchange
    if (body.code) {
      return NextResponse.json({
        success: true,
        connected: true,
        streamKey: `sk_live_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        channelId: "UC" + Math.random().toString(36).substring(2, 15),
        channelName: "StreamLive User Channel",
        accessToken: "ya29." + Math.random().toString(36).substring(2, 50),
        refreshToken: "1//" + Math.random().toString(36).substring(2, 50),
        expiresIn: 3600,
        message: "YouTube OAuth completed successfully",
      })
    }

    return NextResponse.json({ error: "Invalid request", message: "Missing authorization code" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to process OAuth request" },
      { status: 500 },
    )
  }
}
