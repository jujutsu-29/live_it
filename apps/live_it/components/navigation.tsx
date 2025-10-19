"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Video, Calendar, BarChart3, Settings, LogOut, User, Library, Link2, BadgeDollarSign, Menu, User2 } from "lucide-react"
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
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"

const navigation = [
  // { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  // { name: "Schedule", href: "/schedule", icon: Calendar },
  // { name: "Studio", href: "/studio", icon: Video },
  // { name: "Settings", href: "/settings", icon: Settings },
  // { name: "YouTube Links", href: "/youtube-links", icon: Link2 },
  { name: "Video Library", href: "/video-library", icon: Library },
  { name: "Profile", href: "/profile", icon: User2 },
  { name: "Pricing", href: "/pricing", icon: BadgeDollarSign },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = session?.user

  // console.log("User data in Nav:", user);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 glass animate-fade-in">
      <div className="flex items-center space-x-8">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2 hover-lift">
          <Video className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">StreamLive</span>
        </Link>

        {/* Desktop Nav */}
       {user ? (
        <>
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

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="hover-lift bg-transparent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 glass">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    StreamLive
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const active = pathname === item.href
                    return (
                      <SheetClose asChild key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>
                <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                {/* Auth actions */}
                <div className="mt-3">
                  {user ? (
                    <Button variant="ghost" className="w-full justify-start" onClick={() => void signOut()}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </Button>
                  ) : (
                    <SheetClose asChild>
                      <Link href="/auth/signin" className="w-full">
                        <Button variant="ghost" className="w-full justify-start">
                          <LogOut className="h-4 w-4 mr-2" /> Sign In
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </>
      ) : null}
      </div>

      {/* Right cluster (theme + avatar) */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover-lift">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || "image avatar"} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass" align="end" forceMount>
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
              <DropdownMenuItem onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" className="hover-lift bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </nav>
  )
}

