import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

import HomePage from "@/pages/home";
import ProductPage from "@/pages/product";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import LoginPage from "@/pages/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminProductsPage from "@/pages/admin/products";
import AdminCategoriesPage from "@/pages/admin/categories";
import AdminSettingsPage from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter hook={useHashLocation}>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">
                <Router />
              </main>
              <SiteFooter />
            </div>
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
