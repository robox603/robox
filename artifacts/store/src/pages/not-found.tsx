import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متاحة.
        </p>
        <Button className="mt-2 gradient-sky text-white" onClick={() => setLocation("/")} data-testid="button-back-home">
          <Home className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}
