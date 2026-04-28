import { Link, useLocation } from "wouter";
import { ShoppingCart, LayoutDashboard, LogIn, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";

export function SiteHeader() {
  const [, setLocation] = useLocation();
  const { totalQuantity } = useCart();
  useStorageVersion();
  const settings = storage.getSettings();
  const isAdmin = storage.isAdmin();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md"
      data-testid="site-header"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          data-testid="link-home"
          className="flex items-center gap-3 font-bold text-lg hover-elevate active-elevate-2 rounded-lg px-2 py-1"
        >
          {settings.logo ? (
            <img
              src={settings.logo}
              alt={settings.storeName}
              className="h-10 w-10 object-contain rounded-md"
              data-testid="img-store-logo"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-md gradient-sky text-white">
              <Store className="h-5 w-5" />
            </span>
          )}
          <span className="text-gradient-sky" data-testid="text-store-name">
            {settings.storeName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button
              variant="default"
              className="gradient-sky text-white"
              onClick={() => setLocation("/admin")}
              data-testid="button-admin-dashboard"
            >
              <LayoutDashboard className="h-4 w-4 ml-2" />
              لوحة التحكم
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4 ml-2" />
              دخول الأدمن
            </Button>
          )}

          <Button
            variant="outline"
            className="relative"
            onClick={() => setLocation("/cart")}
            data-testid="button-cart"
          >
            <ShoppingCart className="h-4 w-4 ml-2" />
            السلة
            {totalQuantity > 0 && (
              <Badge
                className="absolute -top-2 -left-2 h-5 min-w-5 rounded-full bg-accent text-accent-foreground px-1.5"
                data-testid="badge-cart-count"
              >
                {totalQuantity}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
