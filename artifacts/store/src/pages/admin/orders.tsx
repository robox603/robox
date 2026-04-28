import { useState } from "react";
import { Trash2, Eye, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/admin-layout";
import { storage, type Order } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { formatPrice } from "@/lib/image";

export default function AdminOrdersPage() {
  useStorageVersion();
  const orders = storage.getOrders();
  const [viewing, setViewing] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl" data-testid="text-orders-title">
            الطلبات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة جميع طلبات العملاء</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center" data-testid="empty-orders">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <h2 className="text-xl font-semibold">لا توجد طلبات</h2>
            <p className="text-sm text-muted-foreground">ستظهر طلبات العملاء هنا.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-muted/50 text-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium">العميل</th>
                    <th className="px-4 py-3 font-medium">الجوال</th>
                    <th className="px-4 py-3 font-medium">المنتجات</th>
                    <th className="px-4 py-3 font-medium">الإجمالي</th>
                    <th className="px-4 py-3 font-medium">التاريخ</th>
                    <th className="px-4 py-3 font-medium text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30" data-testid={`row-order-${order.id}`}>
                      <td className="px-4 py-3 font-medium" data-testid={`text-order-name-${order.id}`}>
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground" dir="ltr" data-testid={`text-order-phone-${order.id}`}>
                        {order.customerPhone}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{order.items.length} منتج</Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
                        {formatPrice(order.total)} ر.س
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("ar-SA")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewing(order)}
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(order.id)}
                            data-testid={`button-delete-order-${order.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">العميل</p>
                  <p className="font-medium">{viewing.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الجوال</p>
                  <p className="font-medium" dir="ltr">{viewing.customerPhone}</p>
                </div>
              </div>
              <Separator />
              <p className="font-semibold">المنتجات</p>
              <ul className="flex flex-col gap-2">
                {viewing.items.map((it) => (
                  <li key={it.productId} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                    <span className="line-clamp-1">{it.name} × {it.quantity}</span>
                    <span className="font-semibold">{formatPrice(it.price * it.quantity)} ر.س</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">الإجمالي</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(viewing.total)} ر.س
                </span>
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  let phone = viewing.customerPhone.replace(/[^0-9]/g, "");
                  if (phone.startsWith("00")) phone = phone.slice(2);
                  if (phone.startsWith("0")) phone = "966" + phone.slice(1);
                  window.open(`https://wa.me/${phone}`, "_blank");
                }}
                data-testid="button-contact-customer"
              >
                <MessageCircle className="h-4 w-4 ml-2" />
                تواصل مع العميل عبر واتساب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) storage.deleteOrder(deletingId);
                setDeletingId(null);
              }}
              data-testid="button-confirm-delete-order"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
