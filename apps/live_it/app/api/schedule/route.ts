import { type NextRequest, NextResponse } from "next/server"

interface BookingRequest {
  title: string
  description?: string
  date: string
  time: string
  duration: number
  price: number
}

export async function GET(request: NextRequest) {
  // Mock get all bookings
  const mockBookings = [
    {
      id: "booking_1",
      title: "Weekly Tech Talk",
      description: "Discussion about latest tech trends",
      date: "2024-12-15T14:00:00Z",
      duration: 60,
      status: "upcoming",
      price: 50,
      streamKey: null,
      createdAt: "2024-12-10T10:00:00Z",
    },
    {
      id: "booking_2",
      title: "Product Launch Stream",
      description: "Launching our new product live",
      date: "2024-12-12T16:00:00Z",
      duration: 90,
      status: "completed",
      price: 150,
      streamKey: "sk_live_completed_123",
      viewerCount: 850,
      revenue: 150,
      youtubeUrl: "https://youtube.com/watch?v=example1",
      createdAt: "2024-12-08T09:00:00Z",
    },
  ]

  return NextResponse.json({
    success: true,
    bookings: mockBookings,
    total: mockBookings.length,
  })
}

export async function POST(request: NextRequest) {
  try {
    const booking: BookingRequest = await request.json()

    // Mock validation
    if (!booking.title || !booking.date || !booking.time || !booking.duration) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Missing required fields: title, date, time, duration",
        },
        { status: 400 },
      )
    }

    // Mock price validation
    if (booking.price < 25) {
      return NextResponse.json(
        {
          error: "Invalid price",
          message: "Minimum booking price is $25",
        },
        { status: 400 },
      )
    }

    // Mock successful booking creation
    const newBooking = {
      id: `booking_${Date.now()}`,
      ...booking,
      status: "upcoming",
      streamKey: null,
      paymentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(
      {
        success: true,
        booking: newBooking,
        message: "Booking created successfully",
        paymentStatus: "completed",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create booking",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 })
    }

    // Mock booking update
    const updatedBooking = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 })
    }

    // Mock booking cancellation
    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      refundId: `re_${Math.random().toString(36).substring(2, 15)}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
