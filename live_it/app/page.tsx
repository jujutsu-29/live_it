import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Calendar, Users, Zap, Shield, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">StreamLive</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Professional Live Streaming
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Book your live streaming slots, manage your content calendar, and stream directly to YouTube with our
            professional studio platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Streaming Today
              </Button>
            </Link>
            <Link href="/schedule">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                View Schedule
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Everything You Need to Stream</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>Schedule your streaming slots with our intuitive calendar interface</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Professional Studio</CardTitle>
                <CardDescription>Full-featured streaming studio with camera, mic, and screen sharing</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Live Interaction</CardTitle>
                <CardDescription>Engage with your audience through live chat and viewer analytics</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Instant Setup</CardTitle>
                <CardDescription>Connect your YouTube account and start streaming in minutes</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>Enterprise-grade security with 99.9% uptime guarantee</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>Round-the-clock technical support for all your streaming needs</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Start Your Streaming Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who trust StreamLive for their professional streaming needs.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 StreamLive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
