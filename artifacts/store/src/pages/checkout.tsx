import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { storage, StorageQuotaError } from "@/lib/storage";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/image";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  customerName: z
    .string()
    .min(3, "يرجى إدخال الاسم الثلاثي")
    .refine((v) => v.trim().split(/\s+/).length >= 3, {
      message: "الاسم يجب أن يكون ثلاثياً (3 كلمات على الأقل)",
    }),
  customerPhone: z
    .string()
    .min(9, "يرجى إدخال رقم جوال صحيح")
    .regex(/^[0-9+\s-]+$/u, "رقم الجوال يجب أن يحتوي على أرقام فقط"),
});

type FormValues = z.infer<typeof schema>;

function buildWhatsAppLink(
  storeWhatsapp: string,
  customerName: string,
  customerPhone: string,
  items: { name: string; quantity: number; price: number }[],
  total: number,
  storeName: string,
): string {
  const lines: string[] = [];
  lines.push(`*طلب جديد من ${storeName}*`);
  lines.push("");
  lines.push(`*الاسم:* ${customerName}`);
  lines.push(`*الجوال:* ${customerPhone}`);
  lines.push("");
  lines.push("*تفاصيل الطلب:*");
  items.forEach((it, i) => {
    lines.push(
      `${i + 1}. ${it.name} × ${it.quantity} = ${formatPrice(it.price * it.quantity)} ر.س`,
    );
  });
  lines.push("");
  lines.push(`*الإجمالي النهائي:* ${formatPrice(total)} ر.س`);

  const text = encodeURIComponent(lines.join("\n"));
  // Normalize Saudi phone: 05XXXXXXXX -> 9665XXXXXXXX
  let phone = storeWhatsapp.replace(/[^0-9]/g, "");
  if (phone.startsWith("00")) phone = phone.slice(2);
  if (phone.startsWith("0")) phone = "966" + phone.slice(1);
  return `https://wa.me/${phone}?text=${text}`;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, clear } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const detailed = items
    .map((i) => {
      const p = storage.getProduct(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = detailed.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: "", customerPhone: "" },
  });

  useEffect(() => {
    if (items.length === 0 && !submitting) {
      // No items, send back to cart
      setLocation("/cart");
    }
  }, [items.length, submitting, setLocation]);

  function onSubmit(values: FormValues) {
    if (detailed.length === 0) return;
    setSubmitting(true);
    const settings = storage.getSettings();
    // Do not include image data URLs — they bloat localStorage and cause quota errors.
    const orderItems = detailed.map((d) => ({
      productId: d.product.id,
      name: d.product.name,
      price: d.product.price,
      quantity: d.quantity,
    }));

    const link = buildWhatsAppLink(
      settings.whatsappNumber,
      values.customerName.trim(),
      values.customerPhone.trim(),
      orderItems,
      total,
      settings.storeName,
    );

    try {
      storage.addOrder({
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        items: orderItems,
        total,
      });
    } catch (err) {
      if (err instanceof StorageQuotaError) {
        toast({
          title: "مساحة التخزين ممتلئة",
          description:
            "احذف بعض الطلبات القديمة أو صور المنتجات الكبيرة من لوحة التحكم ثم حاول مرة أخرى. سيتم تحويلك إلى واتساب لإكمال الطلب.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "تعذر حفظ الطلب",
          description: "سيتم تحويلك إلى واتساب لإكمال الطلب.",
          variant: "destructive",
        });
      }
      clear();
      window.location.href = link;
      return;
    }

    clear();
    toast({
      title: "تم تسجيل الطلب",
      description: "سيتم تحويلك إلى واتساب لإكمال الطلب.",
    });
    window.location.href = link;
  }

  if (detailed.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl" data-testid="text-checkout-title">
        إتمام الطلب
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">بيانات العميل</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            بعد إتمام الطلب سنحوّلك مباشرة إلى محادثة واتساب مع تفاصيل طلبك كاملة.
          </p>
          <Separator className="my-5" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الثلاثي</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثال: محمد عبدالله السالم"
                        {...field}
                        data-testid="input-customer-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الجوال</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        {...field}
                        data-testid="input-customer-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="mt-2 gradient-sky text-white"
                disabled={submitting}
                data-testid="button-submit-order"
              >
                <MessageCircle className="h-5 w-5 ml-2" />
                إتمام الطلب عبر واتساب
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              ملخص الطلب
            </div>
            <Separator className="my-4" />
            <ul className="flex flex-col gap-3">
              {detailed.map((item) => (
                <li key={item.productId} className="flex items-center gap-3" data-testid={`summary-item-${item.productId}`}>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.product.price)} ر.س
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(item.product.price * item.quantity)} ر.س
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الإجمالي</span>
              <span className="text-xl font-bold text-primary" data-testid="text-checkout-total">
                {formatPrice(total)} ر.س
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
