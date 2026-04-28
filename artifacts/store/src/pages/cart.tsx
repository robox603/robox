import { Link, useLocation } from "wouter";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { formatPrice } from "@/lib/image";

export default function CartPage() {
  useStorageVersion();
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity } = useCart();

  const detailed = items
    .map((i) => {
      const p = storage.getProduct(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = detailed.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl" data-testid="text-cart-title">سلة التسوق</h1>

      {detailed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center" data-testid="empty-cart">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-semibold">سلتك فارغة</h2>
          <p className="text-sm text-muted-foreground">تصفح المنتجات وأضف ما يعجبك.</p>
          <Button className="mt-2 gradient-sky text-white" onClick={() => setLocation("/")} data-testid="button-continue-shopping">
            <ArrowLeft className="h-4 w-4 ml-2" />
            متابعة التسوق
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-3">
            {detailed.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-xl border bg-card p-3 shadow-sm"
                data-testid={`row-cart-${item.productId}`}
              >
                <Link
                  href={`/product/${item.productId}`}
                  className="block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
                  <Link
                    href={`/product/${item.productId}`}
                    className="font-semibold line-clamp-1 hover:text-primary"
                    data-testid={`text-cart-item-name-${item.productId}`}
                  >
                    {item.product.name}
                  </Link>
                  <span className="text-sm text-muted-foreground" data-testid={`text-cart-item-price-${item.productId}`}>
                    {formatPrice(item.product.price)} ر.س
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold" data-testid={`text-cart-item-qty-${item.productId}`}>
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.productId)}
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">المجموع</p>
                  <p className="font-bold text-primary" data-testid={`text-cart-item-total-${item.productId}`}>
                    {formatPrice(item.product.price * item.quantity)} ر.س
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">ملخص الطلب</h2>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">عدد المنتجات</span>
                <span data-testid="text-summary-count">
                  {detailed.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">الإجمالي</span>
                <span className="text-lg font-bold text-primary" data-testid="text-summary-total">
                  {formatPrice(total)} ر.س
                </span>
              </div>
              <Button
                size="lg"
                className="mt-5 w-full gradient-sky text-white"
                onClick={() => setLocation("/checkout")}
                data-testid="button-checkout"
              >
                إتمام الطلب
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setLocation("/")}
                data-testid="button-continue-shopping"
              >
                متابعة التسوق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
