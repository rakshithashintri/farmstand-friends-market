import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout, Loader2, Info, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

function sameOriginPath(v: string | undefined): string {
  if (!v) return "/dashboard";
  try {
    const url = new URL(v, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    phone: z.string().min(8, "Enter a valid phone number"),
    location: z.string().min(2, "Enter your location"),
    orgName: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

type Role = "farmer" | "buyer";

function RegisterForm() {
  const navigate = useNavigate();
  const redirect = sameOriginPath(Route.useSearch().redirect);
  const [role, setRole] = useState<Role>("farmer");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", location: "", orgName: "", email: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          user_type: role,
          full_name: form.fullName,
          phone: form.phone,
          location: form.location,
          farm_name: role === "farmer" ? form.orgName : null,
          business_name: role === "buyer" ? form.orgName : null,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    void navigate({ to: redirect });
  };

  if (done) {
    return (
      <Card className="text-center">
        <CardContent className="flex flex-col items-center gap-3 p-8">
          <MailCheck className="size-10 text-primary" />
          <h2 className="font-display text-xl font-bold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to {form.email}. Click it to activate your {role} account,
            then sign in.
          </p>
          <Button asChild variant="outline">
            <Link to="/auth">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Join as a farmer or a bulk buyer — separate onboarding for each.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(
            [
              { key: "farmer" as Role, label: "I'm a Farmer" },
              { key: "buyer" as Role, label: "I'm a Bulk Buyer" },
            ]
          ).map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={
                "rounded-lg border-2 px-4 py-3 text-sm font-bold transition-colors " +
                (role === r.key
                  ? "border-primary bg-secondary text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40")
              }
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="reg-name">Full name</Label>
            <Input id="reg-name" value={form.fullName} onChange={set("fullName")} placeholder={role === "farmer" ? "Ramesh Kumar" : "Priya Sharma"} />
            {errors["fullName"] && <p className="text-xs text-destructive">{errors["fullName"]}</p>}
          </div>
          <div>
            <Label htmlFor="reg-org">{role === "farmer" ? "Farm name" : "Business name"}</Label>
            <Input id="reg-org" value={form.orgName} onChange={set("orgName")} placeholder={role === "farmer" ? "Green Valley Farms" : "FreshMart Wholesale"} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="reg-phone">Phone number</Label>
              <Input id="reg-phone" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
              {errors["phone"] && <p className="text-xs text-destructive">{errors["phone"]}</p>}
            </div>
            <div>
              <Label htmlFor="reg-loc">Location</Label>
              <Input id="reg-loc" value={form.location} onChange={set("location")} placeholder="Nashik, Maharashtra" />
              {errors["location"] && <p className="text-xs text-destructive">{errors["location"]}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="reg-pass">Password</Label>
              <Input id="reg-pass" type="password" value={form.password} onChange={set("password")} />
              {errors["password"] && <p className="text-xs text-destructive">{errors["password"]}</p>}
            </div>
            <div>
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input id="reg-confirm" type="password" value={form.confirm} onChange={set("confirm")} />
              {errors["confirm"] && <p className="text-xs text-destructive">{errors["confirm"]}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Register as {role === "farmer" ? "Farmer" : "Bulk Buyer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const redirect = sameOriginPath(Route.useSearch().redirect);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void navigate({ to: redirect, replace: true });
  };

  const forgot = async () => {
    if (!email) {
      toast.error("Enter your email first, then click Forgot password.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent — check your inbox.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your farmer, buyer or admin account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="login-pass">Password</Label>
            <Input id="login-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sign in
          </Button>
          <button type="button" onClick={forgot} className="w-full text-center text-xs text-muted-foreground hover:underline">
            Forgot password?
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

const DEMO_ACCOUNTS = [
  { email: "ramesh@demo.farmmarket", role: "Farmer — Green Valley Farms" },
  { email: "freshmart@demo.farmmarket", role: "Bulk Buyer — FreshMart Wholesale" },
  { email: "admin@demo.farmmarket", role: "Platform Admin" },
];

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: string; redirect?: string } => ({
    ...(typeof search["mode"] === "string" ? { mode: search["mode"] } : {}),
    ...(typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Sign in / Register — FarmBridge" },
      { name: "description", content: "Farmer and bulk buyer registration and sign-in for the FarmBridge marketplace." },
      { property: "og:title", content: "Sign in / Register — FarmBridge" },
      { property: "og:description", content: "Farmer and bulk buyer registration and sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const mode = Route.useSearch().mode;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
      <div className="hidden flex-col justify-center lg:flex">
        <div className="flex items-center gap-2 text-primary">
          <Sprout className="size-8" />
          <span className="font-display text-3xl font-bold">FarmBridge</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight">
          Sell directly to bulk buyers. Buy straight from farmers.
        </h1>
        <p className="mt-3 text-muted-foreground">
          List produce, get smart matches, combine group orders with other farmers, negotiate
          offers and track deliveries — all in one transparent marketplace.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-primary/40 bg-secondary/50 p-4 text-sm">
          <p className="mb-2 flex items-center gap-2 font-bold">
            <Info className="size-4 text-primary" /> Demonstration accounts (password: Demo@1234)
          </p>
          <ul className="space-y-1 text-muted-foreground">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <span className="font-mono text-xs">{a.email}</span> — {a.role}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <Tabs defaultValue={mode === "register" ? "register" : "login"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="mt-4">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
