import { useState, type ChangeEvent } from "react";
import { Save, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/admin-layout";
import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";
import { useToast } from "@/hooks/use-toast";
import { fileToResizedDataUrl } from "@/lib/image";

export default function AdminSettingsPage() {
  useStorageVersion();
  const { toast } = useToast();
  const settings = storage.getSettings();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber);
  const [logo, setLogo] = useState<string | null>(settings.logo);
  const [uploading, setUploading] = useState(false);

  async function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 400, 0.9);
      setLogo(dataUrl);
    } catch {
      toast({ title: "تعذر تحميل الصورة", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSave() {
    const name = storeName.trim();
    const phone = whatsapp.trim();
    if (!name) {
      toast({ title: "اسم المتجر مطلوب", variant: "destructive" });
      return;
    }
    if (!phone) {
      toast({ title: "رقم الواتساب مطلوب", variant: "destructive" });
      return;
    }
    try {
      storage.saveSettings({ storeName: name, whatsappNumber: phone, logo });
      toast({ title: "تم حفظ الإعدادات" });
    } catch {
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
        <div>
          <h1 className="text-2xl font-bold md:text-3xl" data-testid="text-settings-title">
            إعدادات المتجر
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تحكم في هوية متجرك ورقم استلام الطلبات
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">شعار المتجر</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            سيظهر هذا الشعار في أعلى الصفحة بدلاً من الأيقونة الافتراضية.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-muted">
              {logo ? (
                <img src={logo} alt="logo preview" className="h-full w-full object-contain" data-testid="img-logo-preview" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover-elevate active-elevate-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "جاري الرفع..." : logo ? "تغيير الشعار" : "رفع شعار"}
                </span>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogo}
                  data-testid="input-logo"
                />
              </Label>
              {logo && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive justify-start"
                  onClick={() => setLogo(null)}
                  data-testid="button-remove-logo"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  إزالة الشعار
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">معلومات أساسية</h2>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="store-name">اسم المتجر</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                data-testid="input-store-name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wa">رقم الواتساب لاستلام الطلبات</Label>
              <Input
                id="wa"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0556285956"
                dir="ltr"
                data-testid="input-whatsapp"
              />
              <p className="text-xs text-muted-foreground">
                ستُرسل تفاصيل كل طلب تلقائياً إلى هذا الرقم عبر واتساب.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="lg" className="gradient-sky text-white" onClick={handleSave} data-testid="button-save-settings">
            <Save className="h-5 w-5 ml-2" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
