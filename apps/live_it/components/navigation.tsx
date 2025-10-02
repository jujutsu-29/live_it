"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Video, Calendar, BarChart3, Settings, LogOut, User, Library, Link2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Studio", href: "/studio", icon: Video },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "YouTube Links", href: "/youtube-links", icon: Link2 },
  { name: "Video Library", href: "/video-library", icon: Library },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = session?.user

  // console.log("User data in Nav:", user);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 glass animate-fade-in">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2 hover-lift">
          <Video className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">StreamLive</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift animate-stagger",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {status === "loading" ? (
          <span className="text-sm text-muted-foreground">Loading...</span>
        ) : user ? (
          // <DropdownMenu>
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" type="button" className="relative h-8 w-8 rounded-full hover-lift">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || "User"} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass " align="end" forceMount>
            {/* <DropdownMenuContent forceMount className="bg-white z-50 p-4"> */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="hover-lift bg-transparent">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
