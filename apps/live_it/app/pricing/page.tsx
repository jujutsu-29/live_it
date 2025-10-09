import { CheckCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    description: "Get going with essential streaming tools.",
    cta: "Get Starter",
    featured: false,
    features: ["1 live stream per week", "Basic Studio controls", "Email support", "YouTube link management"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For creators streaming regularly.",
    cta: "Upgrade to Pro",
    featured: true,
    features: [
      "Unlimited scheduling",
      "Stream to YouTube RTMP",
      "Priority support",
      "Video library insights",
      "Custom overlays",
    ],
  },
  {
    name: "Enterprise",
    price: "Contact",
    period: "",
    description: "Advanced needs and SLA.",
    cta: "Contact Sales",
    featured: false,
    features: [
      "SLA & onboarding",
      "Dedicated manager",
      "Advanced analytics",
      "Security reviews",
      "Custom integrations",
    ],
  },
]

export default function PricingPage() {
  return (
    <main className="container mx-auto px-6 py-10 animate-fade-in">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">Simple, transparent pricing</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Choose a plan that grows with your audience. No hidden fees.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier, i) => (
          <Card
            key={tier.name}
            className={tier.featured ? "border-primary shadow-lg shadow-primary/10" : "glass"}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between">
                <span>{tier.name}</span>
                <span className="text-primary font-semibold">
                  {tier.price}
                  <span className="text-sm text-muted-foreground font-normal">{tier.period}</span>
                </span>
              </CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full hover-lift" variant={tier.featured ? "default" : "outline"}>
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-card border border-border p-4 glass">
          <h3 className="font-medium">What’s included</h3>
          <p className="text-sm text-muted-foreground mt-2">
            All plans include access to the Studio, scheduling, and YouTube link management. Upgrade anytime.
          </p>
        </div>
        <div className="rounded-lg bg-card border border-border p-4 glass">
          <h3 className="font-medium">Fair billing</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Change plans or cancel at any time. Your changes apply immediately.
          </p>
        </div>
        <div className="rounded-lg bg-card border border-border p-4 glass">
          <h3 className="font-medium">Questions?</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Our team is here to help you choose the right plan for your needs.
          </p>
        </div>
      </section>
    </main>
  )
}
