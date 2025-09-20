"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Clock, DollarSign, CreditCard, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { env } from "@/app/env"

interface TimeSlot {
  time: string
  available: boolean
  price: number
}

interface BookingForm {
  title: string
  description: string
  date: Date | undefined
  time: string
  duration: number
  price: number
}

const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true, price: 50 },
  { time: "10:00", available: false, price: 50 },
  { time: "11:00", available: true, price: 50 },
  { time: "12:00", available: true, price: 60 },
  { time: "13:00", available: false, price: 60 },
  { time: "14:00", available: true, price: 60 },
  { time: "15:00", available: true, price: 60 },
  { time: "16:00", available: true, price: 70 },
  { time: "17:00", available: false, price: 70 },
  { time: "18:00", available: true, price: 70 },
  { time: "19:00", available: true, price: 80 },
  { time: "20:00", available: true, price: 80 },
]

const durations = [
  { value: 30, label: "30 minutes", multiplier: 0.5 },
  { value: 60, label: "1 hour", multiplier: 1 },
  { value: 90, label: "1.5 hours", multiplier: 1.5 },
  { value: 120, label: "2 hours", multiplier: 2 },
  { value: 180, label: "3 hours", multiplier: 2.5 },
]

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    title: "",
    description: "",
    date: undefined,
    time: "",
    duration: 60,
    price: 0,
  })
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { toast } = useToast()

  const selectedTimeSlot = timeSlots.find((slot) => slot.time === selectedTime)
  const selectedDuration = durations.find((d) => d.value === bookingForm.duration)

  useEffect(() => {
    if (selectedTimeSlot && selectedDuration) {
      const basePrice = selectedTimeSlot.price
      const totalPrice = Math.round(basePrice * selectedDuration.multiplier)
      setBookingForm((prev) => ({
        ...prev,
        date: selectedDate,
        time: selectedTime,
        price: totalPrice,
      }))
    }
  }, [selectedDate, selectedTime, bookingForm.duration, selectedTimeSlot, selectedDuration])

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTime(time)
    setIsBookingDialogOpen(true)
  }

  const handleBookingSubmit = async () => {
    if (!bookingForm.title || !bookingForm.date || !bookingForm.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingPayment(true)

    try {
      // Mock Stripe payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock API call to create booking
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingForm,
          date: bookingForm.date?.toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking confirmed!",
          description: `Your stream "${bookingForm.title}" has been scheduled for ${format(
            bookingForm.date,
            "PPP",
          )} at ${bookingForm.time}.`,
        })
        setIsBookingDialogOpen(false)
        setBookingForm({
          title: "",
          description: "",
          date: undefined,
          time: "",
          duration: 60,
          price: 0,
        })
        setSelectedTime("")
        setSelectedDate(undefined)
      } else {
        throw new Error("Failed to create booking")
      }
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Schedule a Stream</h1>
            <p className="text-muted-foreground">
              Choose your preferred date and time for your live streaming session.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose when you want to stream</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  className="rounded-md border border-border"
                />
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Available slots for ${format(selectedDate, "PPP")}`
                    : "Select a date to view available times"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={slot.available ? "outline" : "secondary"}
                        disabled={!slot.available}
                        onClick={() => handleTimeSlotSelect(slot.time)}
                        className={cn(
                          "h-auto p-4 flex flex-col items-center space-y-2",
                          slot.available
                            ? "bg-transparent hover:bg-primary hover:text-primary-foreground"
                            : "opacity-50",
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-sm">{slot.price}/hr</span>
                        </div>
                        {!slot.available && <Badge variant="secondary">Booked</Badge>}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a date to view available time slots</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Dialog */}
          <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book Your Stream</DialogTitle>
                <DialogDescription>
                  Complete your booking for {selectedDate && format(selectedDate, "PPP")} at {selectedTime}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter your stream title"
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your stream will be about"
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={bookingForm.duration.toString()}
                    onValueChange={(value) => setBookingForm((prev) => ({ ...prev, duration: Number.parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Booking Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{selectedDate && format(selectedDate, "PPP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedDuration?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Rate:</span>
                      <span>${selectedTimeSlot?.price}/hr</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${bookingForm.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-border rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-5 bg-blue-600 rounded"></div>
                          <div className="w-8 h-5 bg-red-500 rounded"></div>
                          <div className="w-8 h-5 bg-yellow-500 rounded"></div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Secure payment powered by Stripe
                          <br />
                          <span className="text-xs">Public Key: {env.STRIPE_PUBLIC_KEY}</span>
                        </p>
                      </div>

                      <Button onClick={handleBookingSubmit} disabled={isProcessingPayment} className="w-full" size="lg">
                        {isProcessingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Confirm & Pay ${bookingForm.price}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AuthGuard>
  )
}
