import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSessionProfile, signOutCleanly } from "@/hooks/use-session-profile";
import type { Notification } from "@/lib/marketplace";
import type { Actor } from "@/lib/order-lifecycle";

const NAV: Record<Actor, { to: string; label: string }[]> = {
  farmer: [
    { to: "/farmer", label: "Dashboard" },
    { to: "/farmer/listings", label: "Produce" },
    { to: "/farmer/offers", label: "Offers" },
    { to: "/farmer/group-selling", label: "Group Selling" },
    { to: "/farmer/orders", label: "Orders" },
  ],
  buyer: [
    { to: "/buyer", label: "Dashboard" },
    { to: "/buyer/browse", label: "Browse Produce" },
    { to: "/buyer/requests", label: "My Requests" },
    { to: "/buyer/offers", label: "Offers" },
    { to: "/buyer/orders", label: "Orders" },
  ],
  admin: [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/history", label: "Transactions" },
  ],
};

function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (alive && data) setItems(data);
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [open]);

  const unread = items.filter((n) => !n.is_read).length;

  const markAll = async () => {
    const unreadRows = items.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadRows.length) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadRows);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <button className="text-xs text-muted-foreground hover:underline" onClick={markAll}>
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet.</p>
        )}
        {items.map((n) => (
          <DropdownMenuItem key={n.id} asChild className="flex flex-col items-start gap-0.5">
            <Link to={n.link ?? "/"} className="w-full px-3 py-2">
              <span className="flex w-full items-center gap-2 text-sm font-semibold">
                {!n.is_read && <span className="size-2 rounded-full bg-primary" />}
                {n.title}
              </span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const { session, profile, loading } = useSessionProfile();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = profile ? NAV[(profile.user_type as Actor) ?? "buyer"] ?? [] : [];

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOutCleanly();
    router.invalidate();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <Sprout className="size-6" />
          FarmBridge
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? null : session ? (
            <>
              <NotificationsBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="max-w-40 truncate">
                    {profile?.full_name ?? "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.user_type === "farmer" ? "Farmer" : profile?.user_type === "buyer" ? "Bulk Buyer" : "Admin"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile &amp; settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history">Transaction history</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth" search={{ mode: "register" }}>Join as Farmer / Buyer</Link>
              </Button>
            </>
          )}
          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-card px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Profile &amp; settings
          </Link>
        </nav>
      )}
    </header>
  );
}
