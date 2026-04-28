import { useState, type ChangeEvent } from "react";
import { Pencil, Plus, Trash2, Package, Upload, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin-layout";
import { storage, type Product } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { useToast } from "@/hooks/use-toast";
import { fileToResizedDataUrl, formatPrice } from "@/lib/image";

const NO_CATEGORY = "__none__";

type FormState = {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  image: string;
  categoryId: string;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  image: "",
  categoryId: NO_CATEGORY,
};

export default function AdminProductsPage() {
  useStorageVersion();
  const { toast } = useToast();
  const products = storage.getProducts();
  const categories = storage.getCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice !== undefined ? String(p.oldPrice) : "",
      image: p.image,
      categoryId: p.categoryId ?? NO_CATEGORY,
    });
    setOpen(true);
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 900, 0.85);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      toast({ title: "تعذر تحميل الصورة", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSave() {
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name) {
      toast({ title: "اسم المنتج مطلوب", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: "السعر غير صالح", variant: "destructive" });
      return;
    }
    let oldPrice: number | undefined;
    if (form.oldPrice.trim()) {
      const op = Number(form.oldPrice);
      if (!Number.isFinite(op) || op < 0) {
        toast({ title: "السعر قبل الخصم غير صالح", variant: "destructive" });
        return;
      }
      if (op <= price) {
        toast({
          title: "السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي",
          variant: "destructive",
        });
        return;
      }
      oldPrice = op;
    }

    const payload = {
      name,
      description: form.description.trim(),
      price,
      oldPrice,
      image: form.image,
      categoryId: form.categoryId === NO_CATEGORY ? undefined : form.categoryId,
    };

    try {
      if (editing) {
        storage.updateProduct(editing.id, payload);
        toast({ title: "تم تحديث المنتج" });
      } else {
        storage.addProduct(payload);
        toast({ title: "تمت إضافة المنتج" });
      }
      setOpen(false);
    } catch (err) {
      toast({
        title: "تعذر الحفظ",
        description: "قد تكون مساحة التخزين ممتلئة. جرّب صورة أصغر.",
        variant: "destructive",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl" data-testid="text-products-title">المنتجات</h1>
            <p className="mt-1 text-sm text-muted-foreground">أضف وعدّل وأدر منتجات المتجر</p>
          </div>
          <Button className="gradient-sky text-white" onClick={openCreate} data-testid="button-add-product">
            <Plus className="h-4 w-4 ml-2" />
            منتج جديد
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center" data-testid="empty-products">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Package className="h-7 w-7" />
            </span>
            <h2 className="text-xl font-semibold">لا توجد منتجات</h2>
            <p className="text-sm text-muted-foreground">أضف أول منتج ليظهر في المتجر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const category = categories.find((c) => c.id === p.categoryId);
              const hasDiscount = p.oldPrice !== undefined && p.oldPrice > p.price;
              return (
                <div key={p.id} className="overflow-hidden rounded-xl border bg-card shadow-sm" data-testid={`card-admin-product-${p.id}`}>
                  <div className="relative aspect-video bg-muted">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold line-clamp-1" data-testid={`text-admin-product-name-${p.id}`}>
                          {p.name}
                        </p>
                        {category && (
                          <Badge variant="secondary" className="mt-1">{category.name}</Badge>
                        )}
                      </div>
                      <div className="flex shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingId(p.id)}
                          data-testid={`button-delete-product-${p.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="font-bold text-primary" data-testid={`text-admin-product-price-${p.id}`}>
                        {formatPrice(p.price)} ر.س
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(p.oldPrice!)} ر.س
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل المنتج" : "منتج جديد"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>صورة المنتج</Label>
              <div className="flex items-center gap-3">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted">
                  {form.image ? (
                    <img src={form.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="img-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover-elevate active-elevate-2">
                      <Upload className="h-4 w-4" />
                      {uploading ? "جاري الرفع..." : form.image ? "تغيير الصورة" : "رفع صورة"}
                    </span>
                    <input
                      id="img-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImage}
                      data-testid="input-product-image"
                    />
                  </Label>
                  {form.image && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}
                      data-testid="button-remove-image"
                    >
                      إزالة
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="p-name">اسم المنتج</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم المنتج"
                data-testid="input-product-name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="p-desc">الوصف</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف المنتج"
                rows={3}
                data-testid="input-product-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="p-price">السعر (ر.س)</Label>
                <Input
                  id="p-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  data-testid="input-product-price"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="p-old">السعر قبل الخصم</Label>
                <Input
                  id="p-old"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  placeholder="اختياري"
                  data-testid="input-product-old-price"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>التصنيف</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger data-testid="select-product-category">
                  <SelectValue placeholder="بدون تصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>بدون تصنيف</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  لم تضف تصنيفات بعد. يمكنك إضافتها من صفحة التصنيفات.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} data-testid="button-cancel-product">
              إلغاء
            </Button>
            <Button className="gradient-sky text-white" onClick={handleSave} disabled={uploading} data-testid="button-save-product">
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) storage.deleteProduct(deletingId);
                setDeletingId(null);
              }}
              data-testid="button-confirm-delete-product"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
