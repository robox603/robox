import { useMemo } from "react";
import { Link } from "wouter";
import { Package, Tags, ShoppingBag, TrendingUp, ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { formatPrice } from "@/lib/image";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  testId,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  testId: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm" data-testid={testId}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  useStorageVersion();
  const products = storage.getProducts();
  const categories = storage.getCategories();
  const orders = storage.getOrders();

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const recentOrders = orders.slice(0, 5);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl" data-testid="text-dashboard-title">
            نظرة عامة
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ملخّص أداء متجرك
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="إجمالي الأرباح"
            value={`${formatPrice(totalRevenue)} ر.س`}
            icon={TrendingUp}
            accent="bg-primary/15 text-primary"
            testId="stat-revenue"
          />
          <StatCard
            label="عدد الطلبات"
            value={String(orders.length)}
            icon={ShoppingBag}
            accent="bg-accent/15 text-accent"
            testId="stat-orders"
          />
          <StatCard
            label="عدد المنتجات"
            value={String(products.length)}
            icon={Package}
            accent="bg-sky-500/15 text-sky-600"
            testId="stat-products"
          />
          <StatCard
            label="عدد التصنيفات"
            value={String(categories.length)}
            icon={Tags}
            accent="bg-blue-500/15 text-blue-600"
            testId="stat-categories"
          />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">آخر الطلبات</h2>
            <Link
              href="/admin/orders"
              data-testid="link-all-orders"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              عرض الكل
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground" data-testid="text-no-orders">
              لا توجد طلبات بعد
            </p>
          ) : (
            <div className="mt-4 flex flex-col divide-y">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3"
                  data-testid={`row-recent-order-${order.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate" data-testid={`text-recent-order-name-${order.id}`}>
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} منتج • {new Date(order.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <span className="font-bold text-primary" data-testid={`text-recent-order-total-${order.id}`}>
                    {formatPrice(order.total)} ر.س
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
