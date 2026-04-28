import { useState } from "react";
import { Pencil, Plus, Trash2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AdminLayout } from "@/components/admin-layout";
import { storage, type Category } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategoriesPage() {
  useStorageVersion();
  const { toast } = useToast();
  const categories = storage.getCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setOpen(true);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: "اسم التصنيف مطلوب", variant: "destructive" });
      return;
    }
    if (editing) {
      storage.updateCategory(editing.id, { name: trimmed });
      toast({ title: "تم تحديث التصنيف" });
    } else {
      storage.addCategory(trimmed);
      toast({ title: "تمت إضافة التصنيف" });
    }
    setOpen(false);
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl" data-testid="text-categories-title">التصنيفات</h1>
            <p className="mt-1 text-sm text-muted-foreground">صنّف منتجاتك لتسهيل التصفح</p>
          </div>
          <Button className="gradient-sky text-white" onClick={openCreate} data-testid="button-add-category">
            <Plus className="h-4 w-4 ml-2" />
            تصنيف جديد
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center" data-testid="empty-categories">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Tags className="h-7 w-7" />
            </span>
            <h2 className="text-xl font-semibold">لا توجد تصنيفات</h2>
            <p className="text-sm text-muted-foreground">أضف أول تصنيف لمنتجاتك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const productCount = storage.getProducts().filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm"
                  data-testid={`card-category-${cat.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold" data-testid={`text-category-name-${cat.id}`}>
                      {cat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{productCount} منتج</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(cat)}
                      data-testid={`button-edit-category-${cat.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(cat.id)}
                      data-testid={`button-delete-category-${cat.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل التصنيف" : "تصنيف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Label htmlFor="cat-name">اسم التصنيف</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عطور"
              data-testid="input-category-name"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} data-testid="button-cancel-category">
              إلغاء
            </Button>
            <Button className="gradient-sky text-white" onClick={handleSave} data-testid="button-save-category">
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التصنيف</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إزالة هذا التصنيف من جميع المنتجات المرتبطة به. هل أنت متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) storage.deleteCategory(deletingId);
                setDeletingId(null);
              }}
              data-testid="button-confirm-delete-category"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
