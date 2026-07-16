"use client";

import { BadgeCheck, Mail } from "lucide-react";

import { useSession } from "@/components/layout/session-provider";
import { AppearanceCard } from "@/components/profile/appearance-card";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { PasswordForm } from "@/components/profile/password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { Chip } from "@/components/ui/chip";
import { fullName } from "@/lib/format";
import type { UserRole } from "@/lib/graphql/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  coach: "Entrenador",
  standard: "Estándar",
};

export default function ProfilePage() {
  const { user, loading } = useSession();

  if (loading && !user) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-44 rounded-2xl bg-zinc-100" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-2xl bg-zinc-100" />
          <div className="h-80 rounded-2xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-card">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-black/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:gap-6">
          <AvatarUpload user={user} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-primary-foreground">{fullName(user)}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-primary-foreground">
              <Mail size={13} strokeWidth={1.75} />
              <span className="truncate">{user.email}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user.contextRole ? (
                <Chip className="border-white/20 bg-white/15 text-primary-foreground backdrop-blur-sm">
                  {ROLE_LABELS[user.contextRole]}
                </Chip>
              ) : null}
              {user.isSuperAdmin ? (
                <Chip className="border-white/20 bg-white/15 text-primary-foreground backdrop-blur-sm">
                  <span className="flex items-center gap-1">
                    <BadgeCheck size={12} strokeWidth={2} />
                    Superadmin
                  </span>
                </Chip>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ProfileForm user={user} />
        <div className="space-y-6">
          <PasswordForm />
          <AppearanceCard />
        </div>
      </div>
    </div>
  );
}
