import { useMemo, useState } from "react";
import { Search, Sparkles, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { cn } from "@/lib/utils";

export default function HomePage() {
  useStorageVersion();
  const products = storage.getProducts();
  const categories = storage.getCategories();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !activeCategory || p.categoryId === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950/40 via-background to-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 gradient-sky opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-white md:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              تسوّق آمن وسريع
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl" data-testid="text-hero-title">
              اكتشف منتجاتنا المميزة
            </h1>
            <p className="text-base text-white/90 md:text-lg" data-testid="text-hero-subtitle">
              تشكيلة واسعة من المنتجات المختارة بعناية، مع خصومات حصرية وتوصيل
              مباشر من خلال واتساب.
            </p>
            <div className="mt-2 flex max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-lg ring-1 ring-white/40">
              <Search className="mr-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2" data-testid="categories-filter">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              className={cn(activeCategory === null && "gradient-sky text-white")}
              onClick={() => setActiveCategory(null)}
              data-testid="button-category-all"
            >
              الكل
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                className={cn(activeCategory === cat.id && "gradient-sky text-white")}
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center" data-testid="empty-state">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <h2 className="text-xl font-semibold">
              {products.length === 0
                ? "لم تتم إضافة منتجات بعد"
                : "لا توجد منتجات مطابقة"}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {products.length === 0
                ? "يمكن للأدمن إضافة المنتجات والتصنيفات من لوحة التحكم لتظهر هنا."
                : "جرّب تغيير كلمات البحث أو التصنيف."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
