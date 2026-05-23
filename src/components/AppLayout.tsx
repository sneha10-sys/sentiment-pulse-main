import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Zap, FileText, Clock, Settings, LogOut, Menu, X, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { isDemoMode } from "@/lib/sentiment";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze",   label: "Analyze",   icon: Zap },
  { to: "/batch",     label: "Batch",     icon: FileText },
  { to: "/history",   label: "History",   icon: Clock },
  { to: "/settings",  label: "Settings",  icon: Settings },
];

export const AppLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = (user?.email ?? "U").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 border-r bg-sidebar text-sidebar-foreground hairline flex flex-col transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b hairline">
          <Logo />
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t hairline p-3 space-y-2">
          <div className="flex items-center gap-2.5 rounded-md p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.user_metadata?.name ?? "Account"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 md:pl-60">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between border-b hairline p-3">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <div className="w-5" />
        </header>

        {isDemoMode && (
          <div className="flex items-center gap-2 border-b hairline bg-primary/10 px-4 py-2 text-xs text-primary">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Demo Mode — Python backend not connected. Using local NLP fallback.</span>
          </div>
        )}

        <main className="p-4 md:p-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
