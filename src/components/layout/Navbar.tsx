"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Search, Bookmark, PlusCircle, ChevronDown,
  LogOut, Settings, User, LayoutDashboard, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { connectSocket } from "@/lib/socket";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user as any;
  const [unread, setUnread] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load avatar
  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/user/profile").then((r) => r.json()).then((p) => {
      if (p.avatar) setAvatar(p.avatar);
    }).catch(() => {});
  }, [user?.id]);

  // Fetch unread count + real-time updates
  useEffect(() => {
    if (!user?.id) return;

    fetch("/api/conversations")
      .then((r) => r.json())
      .then((convs: any[]) => {
        if (Array.isArray(convs)) {
          setUnread(convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0));
        }
      });

    const socket = connectSocket(user.id);
    socket.on("conversation-update", () => {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((convs: any[]) => {
          if (Array.isArray(convs)) {
            setUnread(convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0));
          }
        });
    });
    return () => { socket.off("conversation-update"); };
  }, [user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/feed?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 lg:px-6">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 font-bold text-primary text-lg shrink-0">
          <Shield className="h-5 w-5" />
          The Fischer Group
        </Link>

        {/* Search */}
        {session && (
          <form onSubmit={handleSearch} className="relative flex-1 max-w-lg hidden sm:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings, locations..."
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </form>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {session ? (
            <>
              {/* Nav links */}
              <Link href="/feed" className={cn("hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors", pathname === "/feed" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                Listings
              </Link>
              <Link href="/dashboard/listings/new" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <PlusCircle className="h-4 w-4" />
                Post Listing
              </Link>
              <Link href="/dashboard" className={cn("hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors", pathname?.startsWith("/dashboard") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              {/* Messages icon */}
              <Link href="/messages" className="relative p-2 rounded-md text-muted-foreground hover:bg-accent transition-colors">
                <MessageSquare className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {/* Saved */}
              <Link href="/dashboard?tab=saved" className="p-2 rounded-md text-muted-foreground hover:bg-accent transition-colors hidden md:block">
                <Bookmark className="h-5 w-5" />
              </Link>

              {/* Owner dashboard link */}
              {user?.role === "OWNER" && (
                <Link href="/owner-dashboard" className={cn("hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-amber-700 hover:bg-amber-50 transition-colors", pathname?.startsWith("/owner-dashboard") && "bg-amber-50")}>
                  <Settings className="h-4 w-4" />
                  Owner Panel
                </Link>
              )}

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs overflow-hidden shrink-0">
                    {avatar
                      ? <Image src={avatar} alt="Avatar" width={28} height={28} className="object-cover w-full h-full" unoptimized />
                      : user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="hidden md:block font-medium">{user?.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-md border bg-white shadow-lg py-1 z-50">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b">{user?.email}</div>
                    <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                      <User className="h-4 w-4" /> Profile &amp; Settings
                    </Link>
                    <Link href="/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                      <MessageSquare className="h-4 w-4" /> Messages
                    </Link>
                    {user?.role === "OWNER" && (
                      <Link href="/owner-dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-amber-700">
                        <Settings className="h-4 w-4" /> Owner Panel
                      </Link>
                    )}
                    <div className="border-t mt-1">
                      <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-destructive">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link href="/login">Sign in</Link></Button>
              <Button size="sm" asChild><Link href="/signup">Join</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
