"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, List, MessageSquare, Settings, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/owner-dashboard", label: "Overview", icon: BarChart3, exact: true },
  { href: "/owner-dashboard/members", label: "Members", icon: Users },
  { href: "/owner-dashboard/listings", label: "Listings", icon: List },
  { href: "/owner-dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/owner-dashboard/settings", label: "Settings", icon: Settings },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Shield className="h-5 w-5" />
            <div>
              <p>The Fischer Group</p>
              <p className="text-[10px] font-normal text-muted-foreground">Owner Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                <Icon className="h-4 w-4" />{label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <Link href="/feed" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent w-full mb-1">
            ← Back to site
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 w-full">
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
