"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/modules/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import type { Metadata } from "next";

const schema = z.object({
  organizationCode: z.string().min(1, "Organization code is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      setServerError(null);
      const result = await authApi.login(values);

      if (result.mfaRequired) {
        // TODO: navigate to MFA page
        toast.info("MFA verification required");
        return;
      }

      // Extract organizationId and permissions from Access Token
      const decoded = parseJwt(result.tokens.accessToken);
      const orgId = decoded?.org?.id;
      const tokenPermissions = decoded?.session?.permissions ?? [];
      const tokenIsSuperAdmin = decoded?.user?.isSuperAdmin ?? false;

      if (!orgId) {
        throw new Error("Could not extract organization ID from token");
      }

      // Build user object from response
      const user = {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        permissions: tokenPermissions,
        isSuperAdmin: tokenIsSuperAdmin,
        organizationId: orgId,
      };

      setAuth(
        user,
        orgId,
        values.organizationCode.toUpperCase(),
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      // Set the refresh token cookie for Next.js middleware
      document.cookie = `hms_refresh=${result.tokens.refreshToken}; path=/; samesite=lax;`;

      // Fetch full user profile (optional, but good for completeness)
      try {
        await authApi.me();
      } catch (e) {
        console.error("Failed to fetch user profile", e);
      }

      toast.success(`Welcome back, ${result.user.firstName}!`);
      router.replace("/hotels");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed. Please check your credentials.";
      setServerError(msg);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-8">
          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Sign in to HMS
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Hotel Management System
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Organization code */}
            <div className="space-y-1.5">
              <Label htmlFor="organizationCode" className="text-sm font-medium">
                Organization Code
              </Label>
              <Input
                id="organizationCode"
                placeholder="e.g. DEMO"
                autoCapitalize="characters"
                autoComplete="organization"
                className="h-10"
                {...register("organizationCode")}
              />
              {errors.organizationCode && (
                <p className="text-xs text-destructive mt-1">
                  {errors.organizationCode.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="h-10 pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <a
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="h-10 pl-9 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground
                             hover:text-foreground transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-10 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        © {new Date().getFullYear()} HMS — Enterprise Hotel Management
      </p>
    </div>
  );
}
