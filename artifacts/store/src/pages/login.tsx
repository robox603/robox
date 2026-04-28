import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, ShieldCheck } from "lucide-react";
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
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: FormValues) {
    const ok = storage.signIn(values.username, values.password);
    if (ok) {
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك في لوحة التحكم" });
      setLocation("/admin");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-xl">
        <div className="gradient-sky p-6 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-login-title">
                إنشاء حساب
              </h1>
              <p className="text-sm text-white/85">سجّل دخولك للوصول للوحة التحكم</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        placeholder="a7md"
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-destructive" data-testid="text-error">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="mt-2 gradient-sky text-white"
                data-testid="button-signin"
              >
                <LogIn className="h-4 w-4 ml-2" />
                دخول
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
