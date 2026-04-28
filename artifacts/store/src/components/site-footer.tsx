import { storage } from "@/lib/storage";
import { useStorageVersion } from "@/lib/use-storage";

export function SiteFooter() {
  useStorageVersion();
  const settings = storage.getSettings();
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
        <p data-testid="text-footer">
          © {new Date().getFullYear()} {settings.storeName} — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
