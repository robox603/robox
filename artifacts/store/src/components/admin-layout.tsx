import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tags, ShoppingBag, Settings, LogOut, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "التصنيفات", icon: Tags },
  { href: "/admin/settings", label: "إعدادات المتجر", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!storage.isAdmin()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!storage.isAdmin()) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-background to-blue-50 dark:from-background dark:via-background dark:to-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] w-full lg:w-64 shrink-0">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 px-2 py-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg gradient-sky text-white">
                <Store className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">لوحة التحكم</p>
                <p className="text-xs text-muted-foreground">مرحباً، أدمن</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover-elevate active-elevate-2",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground",
                    )}
                    data-testid={`nav-${item.href.replace(/\//g, "-")}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/")}
                data-testid="button-back-to-store"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للمتجر
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  storage.signOut();
                  setLocation("/");
                }}
                data-testid="button-signout"
              >
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
