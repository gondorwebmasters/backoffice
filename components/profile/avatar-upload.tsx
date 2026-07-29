"use client";

import { useMutation } from "@apollo/client";
import { Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Avatar } from "@/components/ui/avatar";
import { useImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/format";
import { UPDATE_USER_PICTURE } from "@/lib/graphql/users";
import type { User } from "@/lib/graphql/types";

export function AvatarUpload({ user }: { user: User }) {
  const t = useTranslations("profile.avatarUpload");
  const toast = useToast();
  const { refetch } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload();
  const [updatePicture, { loading: saving }] = useMutation(UPDATE_USER_PICTURE);

  const busy = uploading || saving;

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const key = await upload(file);
    if (!key) {
      toast(t("uploadFailed"), "error");
      return;
    }
    try {
      const { data } = await updatePicture({ variables: { picture: key, userId: user.id } });
      if (data?.updateUserPicture?.success) {
        toast(t("updated"));
        refetch();
      } else {
        toast(data?.updateUserPicture?.message ?? t("updateFailed"), "error");
      }
    } catch {
      toast(t("updateFailed"), "error");
    }
  };

  return (
    <div className="group relative rounded-full bg-white/20 p-1 backdrop-blur-sm">
      <Avatar size="xl" name={fullName(user)} url={user.pictureUrl?.url} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={t("changePicture")}
        className="absolute inset-1 flex items-center justify-center rounded-full bg-zinc-950/50 opacity-0 transition-opacity duration-200 focus:opacity-100 disabled:opacity-100 group-hover:opacity-100"
      >
        {busy ? (
          <Loader2 size={20} strokeWidth={2} className="animate-spin text-[white]" />
        ) : (
          <Camera size={20} strokeWidth={1.75} className="text-[white]" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
