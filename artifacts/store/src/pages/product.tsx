import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Minus, Plus, ShoppingCart, ArrowRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/image";
import { useToast } from "@/hooks/use-toast";

export default function ProductPage() {
  useStorageVersion();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();
  const product = id ? storage.getProduct(id) : undefined;
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
        <p className="mt-2 text-muted-foreground">قد يكون المنتج قد تم حذفه.</p>
        <Button className="mt-6 gradient-sky text-white" onClick={() => setLocation("/")} data-testid="button-back-home">
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const category = product.categoryId
    ? storage.getCategories().find((c) => c.id === product.categoryId)
    : undefined;

  const hasDiscount =
    product.oldPrice !== undefined && product.oldPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" data-testid="link-breadcrumb-home" className="hover:text-primary">
          الرئيسية
        </Link>
        <ArrowRight className="h-3 w-3 rotate-180" />
        <span data-testid="text-breadcrumb-product">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-md">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              data-testid="img-product-detail"
            />
          ) : (
            <div className="grid aspect-square place-items-center bg-muted text-muted-foreground">
              <ImageOff className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {category && (
            <Badge variant="secondary" className="w-fit" data-testid="badge-product-category">
              {category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold leading-tight md:text-4xl" data-testid="text-product-detail-name">
            {product.name}
          </h1>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-primary" data-testid="text-product-detail-price">
              {formatPrice(product.price)} ر.س
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through" data-testid="text-product-detail-old-price">
                  {formatPrice(product.oldPrice!)} ر.س
                </span>
                <Badge className="bg-destructive text-destructive-foreground">
                  وفّر {discountPct}%
                </Badge>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-base leading-relaxed text-muted-foreground" data-testid="text-product-detail-description">
              {product.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm font-medium">الكمية:</span>
            <div className="flex items-center rounded-lg border bg-card">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                data-testid="button-qty-decrease"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold" data-testid="text-qty">
                {qty}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQty((q) => q + 1)}
                data-testid="button-qty-increase"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gradient-sky text-white"
              onClick={() => {
                addItem(product.id, qty);
                toast({ title: "تمت الإضافة للسلة", description: `${product.name} × ${qty}` });
              }}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-5 w-5 ml-2" />
              أضف إلى السلة
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                addItem(product.id, qty);
                setLocation("/checkout");
              }}
              data-testid="button-buy-now"
            >
              اشترِ الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
