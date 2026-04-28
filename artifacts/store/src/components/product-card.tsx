import { Link } from "wouter";
import { ShoppingCart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/storage";
import { formatPrice } from "@/lib/image";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const hasDiscount =
    product.oldPrice !== undefined && product.oldPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
          {hasDiscount && (
            <Badge
              className="absolute top-3 right-3 bg-destructive text-destructive-foreground shadow-md"
              data-testid={`badge-discount-${product.id}`}
            >
              خصم {discountPct}%
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/product/${product.id}`}
          className="font-semibold leading-snug line-clamp-2 hover:text-primary transition-colors"
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </Link>

        {product.description && (
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            data-testid={`text-product-desc-${product.id}`}
          >
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span
              className="text-lg font-bold text-primary"
              data-testid={`text-product-price-${product.id}`}
            >
              {formatPrice(product.price)} ر.س
            </span>
            {hasDiscount && (
              <span
                className="text-xs text-muted-foreground line-through"
                data-testid={`text-product-old-price-${product.id}`}
              >
                {formatPrice(product.oldPrice!)} ر.س
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="gradient-sky text-white"
            onClick={() => {
              addItem(product.id, 1);
              toast({ title: "تمت الإضافة للسلة", description: product.name });
            }}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4 ml-1" />
            أضف
          </Button>
        </div>
      </div>
    </div>
  );
}
